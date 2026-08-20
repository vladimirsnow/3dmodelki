import React from 'react';
import { EditableText } from './EditableText';
import { useData } from '../context/DataContext';
import { useAdmin } from '../context/AdminContext';

export const AboutSection: React.FC = () => {
  const { settings, updateSetting } = useData();
  const { isAdminMode } = useAdmin();

  // Default pipeline steps stored as JSON in settings
  const defaultSteps = JSON.stringify([
    {
      num: '01',
      title: 'Концепция & ТЗ',
      description: 'Анализируем чертежи, мудборды и спецификации материалов. Формируем единый визуальный стандарт.'
    },
    {
      num: '02',
      title: 'High / Low-Poly Моделирование',
      description: 'Проектируем геометрию с высокой геометрической точностью и чистой топологией сетки.'
    },
    {
      num: '03',
      title: 'PBR Текстурирование (4K)',
      description: 'Создаем физически корректные текстуры в Substance Painter с учетов износа, шероховатости и микрорельефа.'
    },
    {
      num: '04',
      title: 'Real-Time Освещение & UE5',
      description: 'Настраиваем динамический свет Lumen, атмосферный туман и физику материалов в Unreal Engine 5.'
    }
  ]);

  let pipelineSteps: { num: string; title: string; description: string }[];
  try {
    pipelineSteps = JSON.parse(settings.pipelineSteps || defaultSteps);
  } catch {
    pipelineSteps = JSON.parse(defaultSteps);
  }

  const updateStep = async (idx: number, field: 'num' | 'title' | 'description', value: string) => {
    const updated = [...pipelineSteps];
    updated[idx] = { ...updated[idx], [field]: value };
    return await updateSetting('pipelineSteps', JSON.stringify(updated));
  };

  return (
    <section id="about" className="flex flex-col space-y-12 max-w-[1440px] mx-auto px-5 md:px-16 pt-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-4 border-b border-white/10">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#adc6ff] font-semibold block mb-2">
            О студии
          </span>
          <EditableText
            tag="h2"
            className="text-2xl md:text-3xl font-bold text-[#e2e2e2] font-['Inter'] max-w-xl"
            value={settings.aboutTitle || 'Создаём качественную архитектуру, планы интерьеров и модели продвинутого характера'}
            onSave={async (val) => await updateSetting('aboutTitle', val)}
          />
        </div>
        
        <EditableText
          tag="p"
          multiline
          className="text-sm text-[#c4c7c7] max-w-md leading-relaxed"
          value={settings.aboutDescription || 'Art avenue реализует все игровые задумки и проектирует качественные интерьеры для любых задач.'}
          onSave={async (val) => await updateSetting('aboutDescription', val)}
        />
      </div>

      {/* Production Pipeline */}
      <div className="space-y-6">
        <h3 className="text-sm uppercase tracking-widest text-[#c4c7c7] font-semibold">
          Пайплайн разработки
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pipelineSteps.map((step, idx) => (
            <div
              key={idx}
              className={`bg-[#1a1c1c] p-6 rounded-2xl border space-y-4 hover:border-white/20 transition-all group ${
                isAdminMode ? 'border-white/10 ring-1 ring-[#4b8eff]/20' : 'border-white/5'
              }`}
            >
              {isAdminMode && (
                <span className="text-[9px] text-[#4b8eff] uppercase tracking-widest font-bold block -mb-2">
                  ✏ карточка {idx + 1}
                </span>
              )}
              <div className="text-2xl font-bold text-[#adc6ff] font-mono group-hover:text-white transition-colors">
                <EditableText
                  tag="span"
                  className="text-2xl font-bold text-[#adc6ff] font-mono"
                  value={step.num}
                  onSave={async (val) => await updateStep(idx, 'num', val)}
                />
              </div>
              <EditableText
                tag="h4"
                className="text-base font-semibold text-white"
                value={step.title}
                onSave={async (val) => await updateStep(idx, 'title', val)}
              />
              <EditableText
                tag="p"
                multiline
                className="text-xs text-[#c4c7c7] leading-relaxed"
                value={step.description}
                onSave={async (val) => await updateStep(idx, 'description', val)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
