import React from 'react';
import { SERVICES } from '../data/projects';

interface ServicesSectionProps {
  onOpenCalculator: () => void;
  onSelectServiceForInquiry: (serviceTitle: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onOpenCalculator,
  onSelectServiceForInquiry,
}) => {
  return (
    <section id="expertise" className="flex flex-col space-y-8 max-w-[1440px] mx-auto px-5 md:px-16 pt-16">
      {/* Section Header */}
      <div className="text-center pb-2 border-b border-white/10 mb-2">
        <span className="text-xs uppercase tracking-widest text-[#adc6ff] block mb-2 font-semibold">
          Компетенции
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-[#e2e2e2] font-['Inter']">
          Наши услуги
        </h2>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SERVICES.map((service) => (
          <div
            key={service.id}
            className="bg-[#1a1c1c] p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all relative overflow-hidden group border border-white/5 flex flex-col justify-between gap-6 hover:border-white/20"
          >
            <div className="space-y-5">
              {/* Icon */}
              <div className="w-14 h-14 shrink-0 bg-[#282a2b] rounded-xl flex items-center justify-center shadow-inner border border-white/5 group-hover:border-[#4b8eff]/40 transition-colors">
                <span className="material-symbols-outlined text-[#adc6ff] text-2xl group-hover:scale-110 transition-transform">
                  {service.icon}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-lg text-[#e2e2e2] mb-2 font-semibold font-['Inter']">
                  {service.title}
                </h3>
                <p className="text-sm text-[#c4c7c7] leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-2 pt-2 border-t border-white/5 text-xs text-[#c4c7c7]">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4b8eff]"></span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price & Action Footer */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#8e9192] uppercase block">Бюджет</span>
                <span className="text-xs font-bold text-[#adc6ff] font-mono">{service.startingPrice}</span>
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
            <h4 className="text-base font-bold text-white">Нужна индивидуальная оценка бюджета?</h4>
            <p className="text-xs text-[#c4c7c7]">Воспользуйтесь онлайн-калькулятором стоимости и сроков рендеринга.</p>
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
