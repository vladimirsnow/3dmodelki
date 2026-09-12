import { useEffect, useRef, useState, type FC } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface InteractiveModelViewerProps {
  modelUrl: string;
}

export const InteractiveModelViewer: FC<InteractiveModelViewerProps> = ({ modelUrl }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !modelUrl) return;

    setError(null);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090c10');

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(2.8, 1.9, 4.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.className = 'h-full w-full touch-none';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.minDistance = 1.5;
    controls.maxDistance = 9;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.4;
    controls.target.set(0, 0.65, 0);

    scene.add(new THREE.HemisphereLight('#b8d5ff', '#142028', 2.6));
    const keyLight = new THREE.DirectionalLight('#ffffff', 3.2);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight('#4b8eff', 4.5);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(3.4, 64),
      new THREE.MeshStandardMaterial({ color: '#101820', metalness: 0.35, roughness: 0.42 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.1;
    scene.add(floor);

    const grid = new THREE.GridHelper(6, 18, '#285180', '#15283a');
    grid.position.y = -1.08;
    scene.add(grid);

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const scale = 2.35 / (Math.max(size.x, size.y, size.z) || 1);
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        model.position.y -= 0.95;
        scene.add(model);
      },
      undefined,
      () => setError('Не удалось загрузить 3D-модель. Проверьте ссылку в админ-панели.'),
    );

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
        else material?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [modelUrl]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#090c10]">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-4 top-4 border border-white/10 bg-black/45 px-3 py-2 text-[10px] uppercase tracking-widest text-[#d7e4ff] backdrop-blur-sm">
        3D preview
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 border border-white/10 bg-black/45 px-3 py-2 text-[10px] text-[#c4c7c7] backdrop-blur-sm">
        Тяните, чтобы вращать · колесо для масштаба
      </div>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#090c10] p-8 text-center text-sm leading-relaxed text-[#ffb4ab]">
          {error}
        </div>
      )}
    </div>
  );
};
