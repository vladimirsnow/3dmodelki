import React, { useState, useEffect, useRef } from 'react';
import { VIEWPORT_BG } from '../data/projects';
import { EditableText } from './EditableText';
import { useData } from '../context/DataContext';
import { useAdmin } from '../context/AdminContext';

export const TechStackSection: React.FC = () => {
  const [renderMode, setRenderMode] = useState<'rt' | 'wireframe' | 'solid' | 'pbr'>('rt');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  // Local draft percentages for live bar preview while typing
  const [draftPct, setDraftPct] = useState<Record<number, string>>({});
  const [polyCount, setPolyCount] = useState<string>('1.2M');

  const animRef = useRef<number | null>(null);
  const { settings, updateSetting } = useData();
  const { isAdminMode } = useAdmin();

  const defaultTechStack = JSON.stringify([
    { name: 'Blender / Cinema 4D', percentage: 95, description: 'Основной инструмент для создания 3D моделей, сцен и анимации.' },
    { name: 'Unreal Engine 5', percentage: 88, description: 'Среда интерактивной визуализации в реальном времени (Lumen, Nanite).' },
    { name: 'Substance Painter', percentage: 92, description: 'Физически корректное PBR текстурирование с уровнем 4K.' },
    { name: 'ZBrush / Houdini', percentage: 85, description: 'Органический скульптинг и процедурные эффекты.' },
  ]);

  let techStack: { name: string; percentage: number; description: string }[];
  try {
    techStack = JSON.parse(settings.techStackData || defaultTechStack);
  } catch {
    techStack = JSON.parse(defaultTechStack);
  }

  const updateTechItem = async (idx: number, field: 'name' | 'description' | 'percentage', value: string) => {
    const updated = [...techStack];
    updated[idx] = { ...updated[idx], [field]: field === 'percentage' ? Math.min(100, Math.max(0, parseInt(value) || 0)) : value };
    return await updateSetting('techStackData', JSON.stringify(updated));
  };

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
            <EditableText
              tag="h2"
              className="text-2xl md:text-3xl font-bold text-[#e2e2e2] font-['Inter']"
              value={settings.techStackTitle || 'Технологический стек'}
              onSave={async (val) => await updateSetting('techStackTitle', val)}
            />
            <EditableText
              tag="p"
              multiline
              className="text-sm text-[#c4c7c7] mt-3 leading-relaxed"
              value={settings.techStackDesc || 'Мы используем передовое программное обеспечение для достижения бескомпромиссного качества в каждом рендере и модели.'}
              onSave={async (val) => await updateSetting('techStackDesc', val)}
            />
          </div>

          <div className="space-y-6">
            {techStack.map((item, idx) => {
              // live display value: draft if user is editing, else saved
              const displayPct = draftPct[idx] !== undefined ? Number(draftPct[idx]) : item.percentage;
              const clampedPct = Math.min(100, Math.max(0, displayPct || 0));
              return (
              <div key={idx} className={`space-y-2 rounded-xl p-3 -mx-3 transition-colors ${isAdminMode ? 'hover:bg-white/5 ring-1 ring-[#4b8eff]/10' : ''}`}>
                <div className="flex justify-between text-xs font-semibold items-center">
                  <EditableText
                    tag="span"
                    className="text-[#e2e2e2]"
                    value={item.name}
                    onSave={async (val) => await updateTechItem(idx, 'name', val)}
                  />
                  {isAdminMode ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={draftPct[idx] !== undefined ? draftPct[idx] : item.percentage}
                        onChange={(e) => {
                          setDraftPct(prev => ({ ...prev, [idx]: e.target.value }));
                        }}
                        onBlur={async (e) => {
                          const val = String(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)));
                          await updateTechItem(idx, 'percentage', val);
                          setDraftPct(prev => { const n = { ...prev }; delete n[idx]; return n; });
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            const val = String(Math.min(100, Math.max(0, parseInt((e.target as HTMLInputElement).value) || 0)));
                            await updateTechItem(idx, 'percentage', val);
                            setDraftPct(prev => { const n = { ...prev }; delete n[idx]; return n; });
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        className="w-14 bg-black/50 border border-[#4b8eff]/50 rounded px-2 py-0.5 text-[#adc6ff] font-mono text-xs text-right focus:border-[#4b8eff] outline-none"
                      />
                      <span className="text-[#adc6ff] font-mono text-xs">%</span>
                    </div>
                  ) : (
                    <span className="text-[#adc6ff] font-mono">{item.percentage}%</span>
                  )}
                </div>
                <div className="h-1.5 bg-[#1e2020] rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-[#4b8eff] to-[#adc6ff] rounded-full transition-all duration-300"
                    style={{ width: `${clampedPct}%` }}
                  ></div>
                </div>
                <EditableText
                  tag="p"
                  multiline
                  className="text-[11px] text-[#8e9192]"
                  value={item.description}
                  onSave={async (val) => await updateTechItem(idx, 'description', val)}
                />
              </div>
            );
            })}
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
