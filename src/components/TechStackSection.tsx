import React from 'react';
import { Box, Clapperboard, Cuboid, House, Sparkles } from 'lucide-react';
import { EditableText } from './EditableText';
import { InteractiveModelViewer } from './InteractiveModelViewer';
import { useData } from '../context/DataContext';

type StudioService = {
  id: string;
  title: string;
  description: string;
  icon: 'box' | 'house' | 'sparkles' | 'clapperboard';
  price: string;
};

const defaultServices: StudioService[] = [
  { id: 'product', title: '3D-моделирование продуктов', description: 'Предметные модели для каталогов, маркетплейсов, презентаций и рекламы.', icon: 'box', price: 'от 25 000 ₽' },
  { id: 'architecture', title: 'Архитектурная визуализация', description: 'Интерьеры, экстерьеры и атмосферные ракурсы, которые продают идею до строительства.', icon: 'house', price: 'от 1 500 ₽ / м²' },
  { id: 'game', title: 'Игровые ассеты', description: 'Оптимизированные модели, окружение и материалы для Unity, Unreal Engine и модов.', icon: 'sparkles', price: 'от 18 000 ₽' },
  { id: 'animation', title: '3D-анимация и ролики', description: 'Динамичные продуктовые ролики, заставки и визуальные истории для брендов.', icon: 'clapperboard', price: 'от 40 000 ₽' },
];

const iconMap = { box: Cuboid, house: House, sparkles: Sparkles, clapperboard: Clapperboard };

function parseServices(value?: string): StudioService[] {
  if (!value) return defaultServices;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultServices;
  } catch {
    return defaultServices;
  }
}

export const TechStackSection: React.FC = () => {
  const { settings, updateSetting } = useData();
  const services = parseServices(settings.showcaseServicesData);
  const modelUrl = settings.showcaseModelUrl || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

  return (
    <section id="services" className="max-w-[1440px] mx-auto px-5 md:px-16 pt-16">
      <div className="grid items-stretch gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="py-3 lg:py-8">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#adc6ff]">Направления работы</span>
          <EditableText
            tag="h2"
            className="text-3xl font-bold text-[#e2e2e2] md:text-4xl"
            value={settings.showcaseServicesTitle || 'Наши услуги'}
            onSave={async (value) => updateSetting('showcaseServicesTitle', value)}
          />
          <EditableText
            tag="p"
            multiline
            className="mt-4 max-w-xl text-sm leading-relaxed text-[#c4c7c7]"
            value={settings.showcaseServicesDescription || 'Берем на себя весь путь: от идеи и точной модели до финального кадра, анимации или готового игрового ассета.'}
            onSave={async (value) => updateSetting('showcaseServicesDescription', value)}
          />

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {services.map((service) => {
              const Icon = iconMap[service.icon] || Box;
              return (
                <article key={service.id} className="border border-white/10 bg-[#1a1c1c] p-5 transition-colors hover:border-[#4b8eff]/60">
                  <Icon className="mb-5 h-5 w-5 text-[#adc6ff]" aria-hidden="true" />
                  <h3 className="text-base font-semibold text-white">{service.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#aeb3b4]">{service.description}</p>
                  <p className="mt-5 text-xs font-semibold text-[#adc6ff]">{service.price}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="min-h-[440px] overflow-hidden border border-white/10 bg-[#0c0f0f] shadow-2xl md:min-h-[560px]">
          <InteractiveModelViewer modelUrl={modelUrl} />
        </div>
      </div>
    </section>
  );
};
