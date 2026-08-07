import React, { useState } from 'react';
import { SERVICES } from '../data/projects';

interface CostCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyEstimateToForm: (serviceName: string, budget: string, details: string) => void;
}

export const CostCalculatorModal: React.FC<CostCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyEstimateToForm,
}) => {
  if (!isOpen) return null;

  const [selectedServiceId, setSelectedServiceId] = useState<string>('interior-design');
  const [areaOrAssetsCount, setAreaOrAssetsCount] = useState<number>(60); // e.g. 60 sq.m or 3 assets
  const [qualityLevel, setQualityLevel] = useState<'Standard' | 'Ultra AAA' | 'Real-Time UE5'>('Ultra AAA');
  const [include360VR, setInclude360VR] = useState<boolean>(true);
  const [expressTimeline, setExpressTimeline] = useState<boolean>(false);

  // Slider min, max, step calculations based on service
  const minVal = selectedServiceId === 'interior-design' ? 20 : 1;
  const maxVal = selectedServiceId === 'interior-design' ? 500 : 20;
  const stepVal = selectedServiceId === 'interior-design' ? 5 : 1;

  const sliderPercentage = Math.min(
    100,
    Math.max(0, ((areaOrAssetsCount - minVal) / (maxVal - minVal)) * 100)
  );

  // Calculate estimated price in RUB
  const calculatePrice = () => {
    let base = 0;
    if (selectedServiceId === 'interior-design') {
      base = areaOrAssetsCount * 1200; // 1200 rub/m2
    } else if (selectedServiceId === 'game-assets') {
      base = (areaOrAssetsCount / 10) * 35000; // assets count
    } else {
      base = 50000; // mods
    }

    if (qualityLevel === 'Ultra AAA') base *= 1.3;
    if (qualityLevel === 'Real-Time UE5') base *= 1.4;
    if (include360VR) base += 15000;
    if (expressTimeline) base *= 1.25;

    return Math.round(base);
  };

  const estimatedPrice = calculatePrice();

  const handleSendToContact = () => {
    const serviceName = SERVICES.find(s => s.id === selectedServiceId)?.title || 'Индивидуальный 3D проект';
    const budgetText = `~${estimatedPrice.toLocaleString('ru-RU')} ₽`;
    const detailsText = `Расчет калькулятора:\n- Услуга: ${serviceName}\n- Объем/Параметры: ${areaOrAssetsCount} ${selectedServiceId === 'interior-design' ? 'м²' : 'ед.'}\n- Качество: ${qualityLevel}\n- 360° VR Панорама: ${include360VR ? 'Да' : 'Нет'}\n- Экспресс-срок: ${expressTimeline ? 'Да' : 'Нет'}`;

    onApplyEstimateToForm(serviceName, budgetText, detailsText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1e2020] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden my-auto">
        
        {/* Sticky Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 shrink-0 bg-[#1e2020]/95 backdrop-blur-md z-10">
          <div>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#adc6ff] font-semibold block">
              Калькулятор 3D Визуализации
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">Быстрый расчет стоимости</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer shrink-0"
            aria-label="Закрыть"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Scrollable Body Content for Mobile & Desktop */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Service Selector */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[#c4c7c7] font-semibold block">
              1. Выберите услугу
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedServiceId(s.id);
                    setAreaOrAssetsCount(s.id === 'interior-design' ? 60 : 3);
                  }}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    selectedServiceId === s.id
                      ? 'bg-[#4b8eff]/20 border-[#4b8eff] text-white shadow-[0_0_15px_rgba(75,142,255,0.15)]'
                      : 'bg-[#1a1c1c] border-white/5 text-[#c4c7c7] hover:border-white/20'
                  }`}
                >
                  <div className="font-bold mb-1">{s.title}</div>
                  <div className="text-[10px] text-[#adc6ff]">{s.startingPrice}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Smooth Quantity Slider */}
          <div className="space-y-3 bg-[#1a1c1c] p-4 rounded-xl border border-white/5 shadow-inner">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#c4c7c7] font-semibold">
                {selectedServiceId === 'interior-design' ? '2. Площадь помещения (м²)' : '2. Количество моделей / ассетов'}
              </span>
              <span className="font-bold text-[#adc6ff] text-base font-mono bg-[#121414] px-2.5 py-1 rounded border border-white/10">
                {areaOrAssetsCount} {selectedServiceId === 'interior-design' ? 'м²' : 'ед.'}
              </span>
            </div>

            <div className="pt-2 px-1">
              <input
                type="range"
                min={minVal}
                max={maxVal}
                step={stepVal}
                value={areaOrAssetsCount}
                onChange={(e) => setAreaOrAssetsCount(Number(e.target.value))}
                className="custom-slider"
                style={{
                  background: `linear-gradient(to right, #4b8eff 0%, #4b8eff ${sliderPercentage}%, #121414 ${sliderPercentage}%, #121414 100%)`,
                }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-[#8e9192] font-mono px-1">
              <span>{minVal} {selectedServiceId === 'interior-design' ? 'м²' : 'ед.'}</span>
              <span>{maxVal} {selectedServiceId === 'interior-design' ? 'м²' : 'ед.'}</span>
            </div>
          </div>

          {/* Quality Options */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[#c4c7c7] font-semibold block">
              3. Уровень детализации & Рендера
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Standard', 'Ultra AAA', 'Real-Time UE5'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQualityLevel(q)}
                  className={`py-2.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    qualityLevel === q
                      ? 'bg-[#4b8eff] text-[#00285c] border-[#4b8eff] shadow-md'
                      : 'bg-[#1a1c1c] border-white/5 text-[#c4c7c7] hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options with Custom Smooth Checkboxes */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[#c4c7c7] font-semibold block">
              4. Дополнительные опции
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setInclude360VR(!include360VR)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  include360VR
                    ? 'bg-[#4b8eff]/10 border-[#4b8eff] text-white shadow-[0_0_15px_rgba(75,142,255,0.1)]'
                    : 'bg-[#1a1c1c] border-white/5 text-[#c4c7c7] hover:border-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                    include360VR ? 'bg-[#4b8eff] border-[#4b8eff] text-[#00285c]' : 'bg-[#121414] border-white/20'
                  }`}
                >
                  {include360VR && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                </div>
                <span className="text-xs font-medium">Интерактивная 360° VR панорама</span>
              </button>

              <button
                type="button"
                onClick={() => setExpressTimeline(!expressTimeline)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  expressTimeline
                    ? 'bg-[#4b8eff]/10 border-[#4b8eff] text-white shadow-[0_0_15px_rgba(75,142,255,0.1)]'
                    : 'bg-[#1a1c1c] border-white/5 text-[#c4c7c7] hover:border-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                    expressTimeline ? 'bg-[#4b8eff] border-[#4b8eff] text-[#00285c]' : 'bg-[#121414] border-white/20'
                  }`}
                >
                  {expressTimeline && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                </div>
                <span className="text-xs font-medium">Срочный порядок (Сроки х2)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Summary Footer */}
        <div className="p-4 sm:p-5 bg-[#121414] border-t border-white/10 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
          <div className="w-full sm:w-auto text-center sm:text-left">
            <span className="text-[10px] text-[#8e9192] uppercase block">Ориентировочная стоимость:</span>
            <span className="text-xl sm:text-2xl font-bold text-[#adc6ff] font-mono">
              ~{estimatedPrice.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          <button
            onClick={handleSendToContact}
            className="w-full sm:w-auto bg-[#4b8eff] text-[#00285c] px-6 py-3.5 rounded-xl font-semibold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-lg text-center"
          >
            Перенести в заявку
          </button>
        </div>
      </div>
    </div>
  );
};

