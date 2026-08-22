import React from 'react';
import { EditableText } from './EditableText';
import { useData } from '../context/DataContext';

interface HeroProps {
  onExploreProjects: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreProjects }) => {
  const { settings, updateSetting, loading } = useData();

  if (loading) return <div className="h-screen w-full flex items-center justify-center">Загрузка...</div>;

  return (
    <section className="flex flex-col pt-24 md:pt-32 pb-12 min-h-[90vh] justify-center relative overflow-hidden">
      {/* Absolute Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/img/hero-win11-bg.jpg" 
          alt="Premium 3D Abstract Background" 
          className="w-full h-full object-cover opacity-60 mix-blend-screen animate-in fade-in duration-1000"
        />
        {/* Gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#121414] via-[#121414]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121414]/40 to-[#121414]"></div>
      </div>

      {/* Main Hero Content (Single column over background) */}
      <div className="flex flex-col items-start gap-8 relative z-10 max-w-[1440px] mx-auto w-full px-5 md:px-16">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-widest text-[#adc6ff] animate-pulse shadow-lg backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#4b8eff]"></span>
          <EditableText
            tag="span"
            className="text-xs font-semibold uppercase tracking-widest text-[#adc6ff]"
            value={settings.heroBadge || 'Art avenue 3D Real-Time Studio 2026'}
            onSave={async (val) => await updateSetting('heroBadge', val)}
          />
        </div>

        <EditableText 
          tag="h1" 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] text-[#e2e2e2] font-bold leading-[1.1] tracking-tight font-['Inter'] max-w-4xl"
          value={settings.heroTitle || 'СТУДИЯ ПРЕМИАЛЬНОГО 3D ДИЗАЙНА'}
          onSave={async (val) => await updateSetting('heroTitle', val)}
        />
          
        <EditableText
          tag="h2"
          className="text-2xl sm:text-3xl font-medium text-[#adc6ff]/90 bg-gradient-to-r from-[#adc6ff] to-[#4b8eff] bg-clip-text text-transparent max-w-3xl"
          value={settings.heroSubtitle || 'Воплощаем идеи в гиперреалистичные визуализации'}
          onSave={async (val) => await updateSetting('heroSubtitle', val)}
        />

        <EditableText 
          tag="p"
          multiline
          className="text-base md:text-lg text-[#c4c7c7] max-w-2xl leading-relaxed bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/5"
          value={settings.heroDescription || 'Art Avenue Studio — это команда профессионалов, создающая премиальные 3D решения для архитектуры, game dev индустрии и промышленного дизайна.'}
          onSave={async (val) => await updateSetting('heroDescription', val)}
        />

        {/* Hero CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
          <a
            href="#portfolio"
            onClick={(e) => {
              e.preventDefault();
              onExploreProjects();
            }}
            className="w-full sm:w-auto bg-[#4b8eff] text-[#00285c] px-8 py-4 rounded-xl font-semibold text-xs tracking-wider uppercase text-center flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(75,142,255,0.4)] cursor-pointer backdrop-blur-md"
          >
            <span>СМОТРЕТЬ РАБОТЫ</span>
            <span className="material-symbols-outlined text-lg">arrow_downward</span>
          </a>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="max-w-[1440px] mx-auto w-full px-5 md:px-16 relative z-10 mt-16">
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 border-t border-white/10">
        <div className="flex flex-col">
          <EditableText
            tag="span"
            className="text-2xl sm:text-3xl font-bold text-white"
            value={settings.heroMetric1Value || '150+'}
            onSave={async (val) => await updateSetting('heroMetric1Value', val)}
          />
          <EditableText
            tag="span"
            className="text-xs text-[#c4c7c7] uppercase tracking-wider mt-1"
            value={settings.heroMetric1Label || 'Завершенных проектов'}
            onSave={async (val) => await updateSetting('heroMetric1Label', val)}
          />
        </div>
        <div className="flex flex-col">
          <EditableText
            tag="span"
            className="text-2xl sm:text-3xl font-bold text-[#adc6ff]"
            value={settings.heroMetric2Value || '4K UHD'}
            onSave={async (val) => await updateSetting('heroMetric2Value', val)}
          />
          <EditableText
            tag="span"
            className="text-xs text-[#c4c7c7] uppercase tracking-wider mt-1"
            value={settings.heroMetric2Label || 'Качество рендеров'}
            onSave={async (val) => await updateSetting('heroMetric2Label', val)}
          />
        </div>
        <div className="flex flex-col">
          <EditableText
            tag="span"
            className="text-2xl sm:text-3xl font-bold text-white"
            value={settings.heroMetric3Value || 'Unreal Engine 5'}
            onSave={async (val) => await updateSetting('heroMetric3Value', val)}
          />
          <EditableText
            tag="span"
            className="text-xs text-[#c4c7c7] uppercase tracking-wider mt-1"
            value={settings.heroMetric3Label || 'Lumen & Nanite'}
            onSave={async (val) => await updateSetting('heroMetric3Label', val)}
          />
        </div>
        <div className="flex flex-col">
          <EditableText
            tag="span"
            className="text-2xl sm:text-3xl font-bold text-[#e9c349]"
            value={settings.heroMetric4Value || '100% PBR'}
            onSave={async (val) => await updateSetting('heroMetric4Value', val)}
          />
          <EditableText
            tag="span"
            className="text-xs text-[#c4c7c7] uppercase tracking-wider mt-1"
            value={settings.heroMetric4Label || 'Точность материалов'}
            onSave={async (val) => await updateSetting('heroMetric4Label', val)}
          />
        </div>
      </div>
      </div>
    </section>
  );
};
