import React from 'react';
import { useData } from '../context/DataContext';
import { useAdmin } from '../context/AdminContext';
import { EditableText } from './EditableText';

interface ServicesSectionProps {
  onOpenCalculator: () => void;
  onSelectServiceForInquiry: (serviceTitle: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onOpenCalculator,
  onSelectServiceForInquiry,
}) => {
  const { services, settings, updateSetting } = useData();
  const { isAdminMode } = useAdmin();

  // Services data stored as JSON in settings for inline editing
  // Falls back to DB services if no custom data stored
  let editableServices: { id: string; icon: string; title: string; description: string; features: string[]; startingPrice: string; estimatedDays: string }[];
  try {
    const stored = settings.servicesData;
    editableServices = stored ? JSON.parse(stored) : services.map(s => ({
      id: s.id,
      icon: s.icon,
      title: s.title,
      description: s.description,
      features: s.features,
      startingPrice: s.startingPrice,
      estimatedDays: s.estimatedDays,
    }));
  } catch {
    editableServices = services.map(s => ({
      id: s.id,
      icon: s.icon,
      title: s.title,
      description: s.description,
      features: s.features,
      startingPrice: s.startingPrice,
      estimatedDays: s.estimatedDays,
    }));
  }

  const updateServiceField = async (idx: number, field: string, value: string | string[]) => {
    const updated = [...editableServices];
    updated[idx] = { ...updated[idx], [field]: value };
    return await updateSetting('servicesData', JSON.stringify(updated));
  };

  const updateFeature = async (svcIdx: number, featIdx: number, value: string) => {
    const updated = [...editableServices];
    const features = [...updated[svcIdx].features];
    features[featIdx] = value;
    updated[svcIdx] = { ...updated[svcIdx], features };
    return await updateSetting('servicesData', JSON.stringify(updated));
  };

  return (
    <section id="expertise" className="flex flex-col space-y-8 max-w-[1440px] mx-auto px-5 md:px-16 pt-16">
      {/* Section Header */}
      <div className="text-center pb-2 border-b border-white/10 mb-2">
        <span className="text-xs uppercase tracking-widest text-[#adc6ff] block mb-2 font-semibold">
          Компетенции
        </span>
        <EditableText
          tag="h2"
          className="text-2xl md:text-3xl font-bold text-[#e2e2e2] font-['Inter']"
          value={settings.servicesTitle || 'Наши услуги'}
          onSave={async (val) => await updateSetting('servicesTitle', val)}
        />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {editableServices.map((service, svcIdx) => (
          <div
            key={service.id}
            className={`bg-[#1a1c1c] p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all relative overflow-hidden group border flex flex-col justify-between gap-6 hover:border-white/20 ${
              isAdminMode ? 'border-[#4b8eff]/20' : 'border-white/5'
            }`}
          >
            {isAdminMode && (
              <span className="text-[9px] text-[#4b8eff] uppercase tracking-widest font-bold -mb-4">
                ✏ карточка услуги {svcIdx + 1}
              </span>
            )}
            <div className="space-y-5">
              {/* Icon */}
              <div className="w-14 h-14 shrink-0 bg-[#282a2b] rounded-xl flex items-center justify-center shadow-inner border border-white/5 group-hover:border-[#4b8eff]/40 transition-colors">
                <span className="material-symbols-outlined text-[#adc6ff] text-2xl group-hover:scale-110 transition-transform">
                  {service.icon}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <EditableText
                  tag="h3"
                  className="text-lg text-[#e2e2e2] mb-2 font-semibold font-['Inter']"
                  value={service.title}
                  onSave={async (val) => await updateServiceField(svcIdx, 'title', val)}
                />
                <EditableText
                  tag="p"
                  multiline
                  className="text-sm text-[#c4c7c7] leading-relaxed"
                  value={service.description}
                  onSave={async (val) => await updateServiceField(svcIdx, 'description', val)}
                />
              </div>

              {/* Features List */}
              <ul className="space-y-2 pt-2 border-t border-white/5 text-xs text-[#c4c7c7]">
                {service.features.map((feature, featIdx) => (
                  <li key={featIdx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4b8eff] shrink-0"></span>
                    <EditableText
                      tag="span"
                      className="flex-1"
                      value={feature}
                      onSave={async (val) => await updateFeature(svcIdx, featIdx, val)}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* Price & Action Footer */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#8e9192] uppercase block">Бюджет</span>
                <EditableText
                  tag="span"
                  className="text-xs font-bold text-[#adc6ff] font-mono"
                  value={service.startingPrice}
                  onSave={async (val) => await updateServiceField(svcIdx, 'startingPrice', val)}
                />
              </div>

              <button
                onClick={() => onSelectServiceForInquiry(service.title)}
                className="px-4 py-2 bg-[#282a2b] hover:bg-[#4b8eff] hover:text-[#00285c] text-white text-xs font-semibold rounded-lg transition-all cursor-pointer border border-white/10"
              >
                Заказать
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Calculator Banner */}
      <div className="bg-gradient-to-r from-[#1a1c1c] via-[#1e2020] to-[#282a2b] p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#4b8eff]/20 text-[#4b8eff] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">calculate</span>
          </div>
          <div>
            <EditableText
              tag="h4"
              className="text-base font-bold text-white"
              value={settings.calcBannerTitle || 'Нужна индивидуальная оценка бюджета?'}
              onSave={async (val) => await updateSetting('calcBannerTitle', val)}
            />
            <EditableText
              tag="p"
              className="text-xs text-[#c4c7c7]"
              value={settings.calcBannerSubtitle || 'Воспользуйтесь онлайн-калькулятором стоимости и сроков рендеринга.'}
              onSave={async (val) => await updateSetting('calcBannerSubtitle', val)}
            />
          </div>
        </div>

        <button
          onClick={onOpenCalculator}
          className="w-full sm:w-auto bg-[#4b8eff] text-[#00285c] px-6 py-3 rounded-xl font-semibold text-xs tracking-wider uppercase hover:brightness-110 transition-all cursor-pointer shrink-0 shadow-md"
        >
          Рассчитать стоимость
        </button>
      </div>
    </section>
  );
};
