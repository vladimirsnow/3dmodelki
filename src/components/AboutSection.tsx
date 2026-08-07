import React from 'react';

export const AboutSection: React.FC = () => {
  const pipelineSteps = [
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
  ];

  return (
    <section id="about" className="flex flex-col space-y-12 max-w-[1440px] mx-auto px-5 md:px-16 pt-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-4 border-b border-white/10">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#adc6ff] font-semibold block mb-2">
            О студии
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#e2e2e2] font-['Inter'] max-w-xl">
            Мы соединяем архитектурное искусство с технологиями игровых движков
          </h2>
        </div>
        <p className="text-sm text-[#c4c7c7] max-w-md leading-relaxed">
          Lumina Studio — международная команда 3D-художников, архитекторов и специалиста по Unreal Engine 5.
        </p>
      </div>

      {/* Production Pipeline */}
      <div className="space-y-6">
        <h3 className="text-sm uppercase tracking-widest text-[#c4c7c7] font-semibold">
          Пайплайн разработки
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pipelineSteps.map((step) => (
            <div
              key={step.num}
              className="bg-[#1a1c1c] p-6 rounded-2xl border border-white/5 space-y-4 hover:border-white/20 transition-all group"
            >
              <div className="text-2xl font-bold text-[#adc6ff] font-mono group-hover:text-white transition-colors">
                {step.num}
              </div>
              <h4 className="text-base font-semibold text-white">{step.title}</h4>
              <p className="text-xs text-[#c4c7c7] leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
