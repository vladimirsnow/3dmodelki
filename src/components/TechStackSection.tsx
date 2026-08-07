import React, { useState, useEffect, useRef } from 'react';
import { TECH_STACK, VIEWPORT_BG } from '../data/projects';

export const TechStackSection: React.FC = () => {
  const [renderMode, setRenderMode] = useState<'rt' | 'wireframe' | 'solid' | 'pbr'>('rt');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [polyCount, setPolyCount] = useState<string>('1.2M');

  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRotating) {
      const animate = () => {
        setRotationAngle((prev) => (prev + 0.5) % 360);
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
    } else if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isRotating]);

  return (
    <section id="tech-stack" className="flex flex-col space-y-8 max-w-[1440px] mx-auto px-5 md:px-16 pt-16">
      <div className="flex flex-col md:flex-row items-center gap-12 bg-[#1a1c1c] rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Glow ambient spots */}
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-[#c8c6c5]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-[#4b8eff]/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Left Column: Progress Bars */}
        <div className="w-full md:w-1/2 space-y-8 relative z-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#adc6ff] font-semibold block mb-2">
              Софт и Инструменты
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#e2e2e2] font-['Inter']">
              Технологический стек
            </h2>
            <p className="text-sm text-[#c4c7c7] mt-3 leading-relaxed">
              Мы используем передовое программное обеспечение для достижения бескомпромиссного качества в каждом рендере и модели.
            </p>
          </div>

          <div className="space-y-6">
            {TECH_STACK.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#e2e2e2]">{item.name}</span>
                  <span className="text-[#adc6ff] font-mono">{item.percentage}%</span>
                </div>
                <div className="h-1.5 bg-[#1e2020] rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-[#4b8eff] to-[#adc6ff] rounded-full transition-all duration-1000"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-[#8e9192]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Viewport 2.0 Card */}
        <div className="w-full md:w-1/2 relative z-10">
          <div className="relative w-full aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 rounded-2xl border border-white/10 bg-[#121414]/90 backdrop-blur-xl p-4 flex flex-col shadow-2xl">
              {/* Viewport Top Bar */}
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#e9c349]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#adc6ff]"></div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#c4c7c7] uppercase font-mono tracking-wider">
                    Viewport 2.0
                  </span>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                </div>
              </div>

              {/* Viewport Controls Bar */}
              <div className="flex items-center justify-between gap-1 mb-3 bg-[#1e2020] p-1.5 rounded-lg border border-white/5 text-[10px]">
                <div className="flex gap-1">
                  <button
                    onClick={() => { setRenderMode('rt'); setPolyCount('1.2M'); }}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      renderMode === 'rt' ? 'bg-[#4b8eff] text-[#00285c] font-bold' : 'text-[#c4c7c7] hover:bg-white/5'
                    }`}
                  >
                    RT On
                  </button>
                  <button
                    onClick={() => { setRenderMode('wireframe'); setPolyCount('650K Wire'); }}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      renderMode === 'wireframe' ? 'bg-[#4b8eff] text-[#00285c] font-bold' : 'text-[#c4c7c7] hover:bg-white/5'
                    }`}
                  >
                    Wireframe
                  </button>
                  <button
                    onClick={() => { setRenderMode('pbr'); setPolyCount('1.2M PBR'); }}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      renderMode === 'pbr' ? 'bg-[#4b8eff] text-[#00285c] font-bold' : 'text-[#c4c7c7] hover:bg-white/5'
                    }`}
                  >
                    Textured
                  </button>
                </div>

                <button
                  onClick={() => setIsRotating(!isRotating)}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white font-mono flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[12px]">
                    {isRotating ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{isRotating ? '3D Auto' : 'Paused'}</span>
                </button>
              </div>

              {/* 3D Visual Render Box */}
              <div
                className="flex-1 rounded-xl border border-white/10 bg-[#0c0f0f] relative overflow-hidden flex items-center justify-center transition-all duration-500"
                style={{
                  backgroundImage: renderMode !== 'wireframe' ? `url('${VIEWPORT_BG}')` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Mode Overlay Tint */}
                {renderMode === 'wireframe' && (
                  <div className="absolute inset-0 bg-[#0c0f0f] flex items-center justify-center p-4">
                    <svg
                      className="w-full h-full text-[#4b8eff] stroke-current transition-transform duration-75"
                      fill="none"
                      strokeWidth="0.8"
                      viewBox="0 0 100 100"
                      style={{ transform: `rotateY(${rotationAngle}deg) rotateX(${rotationAngle / 2}deg)` }}
                    >
                      <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" />
                      <path d="M50 10 L50 50 L90 30" />
                      <path d="M50 50 L90 70" />
                      <path d="M50 50 L50 90" />
                      <path d="M50 50 L10 70" />
                      <path d="M50 50 L10 30" />
                      <circle cx="50" cy="50" r="3" fill="#adc6ff" />
                      <circle cx="90" cy="30" r="1.5" fill="#4b8eff" />
                      <circle cx="10" cy="30" r="1.5" fill="#4b8eff" />
                      <circle cx="50" cy="90" r="1.5" fill="#4b8eff" />
                    </svg>
                  </div>
                )}

                {renderMode === 'rt' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none flex items-center justify-center">
                    <div
                      className="w-48 h-48 rounded-full border border-[#4b8eff]/30 animate-spin-slow flex items-center justify-center pointer-events-none"
                      style={{ transform: `rotate(${rotationAngle}deg)` }}
                    >
                      <div className="w-32 h-32 rounded-full border border-[#e9c349]/20"></div>
                    </div>
                  </div>
                )}

                {/* Viewport Live HUD Watermark */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-mono text-[#adc6ff] border border-white/5">
                  FPS: 60.0 | VRAM: 4.2GB
                </div>
              </div>

              {/* Viewport Bottom Stats */}
              <div className="mt-3 flex justify-between items-center text-[10px] text-[#c4c7c7] font-mono">
                <div>Polys: <span className="text-white font-bold">{polyCount}</span></div>
                <div className="text-[#adc6ff]">Render: {renderMode === 'rt' ? 'RT On (Hardware)' : renderMode.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
