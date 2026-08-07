import { Project, Service, TechItem } from '../types';

export const STUDIO_LOGO = "https://lh3.googleusercontent.com/aida/AP1WRLvrrm5Kl-YMCraOGKZ03AYw3CKFH7pKW1Gla1s7-CBKyfoPL1lH3A_Klb3BtnPrxIOGyjBc8oVB_cgi_8ZjdCiLH0udjzF1hb1Ftq8PMDqdy65UzxgW_qRNqlXJu9N-GKnUym0yq8HlnvnUyjz3qIHBvluV75u4hnNJQv9hU_5WSV3Q0Ttr6kSTgaf5-jU5r7l_UGQ610ozPAewn3TTF3BuNRf9HxcXpQlBFvPqyaVo2z0Shgm-FEjzu-j2";

export const USER_AVATAR = "https://lh3.googleusercontent.com/aida/AP1WRLs6l6K91uOn4UZ-3o0f9dJIPmOn6XaMnPF7JH4PEgE5T-aRfkODDySsdDqY0T65zTRBOngQG-LMLOk8oqIzuGecxXMJcU8v8ECnRq5xAVCPAEgEUIvUX11KqNfAG0h1ZFWZcAlf9n_vbjYvNCCnYOeVAqyVljJvJJWaUyQ4rNeX0CK7M22BBQWva9b1-_NrtmHgn_I-sDW1W3c-epRWEevR76JQI3ypkGa8-0z3el5hapNzO1VrzXUeulrh";

export const VIEWPORT_BG = "https://lh3.googleusercontent.com/aida-public/AB6AXuAB6joXtA8doH27jI7Wl3Y8EAVN5FWoxL_RzOLA34T06s8j2cjZ3_LbG_dq9lqHJwsLeNFFJ3n9zdKI5DymPbPeMId7audzM1CeyoBrUvA2fHy0v7vCx5bpVnCdmdn0FE90aRXXe6zpFYS8IJUfu-nlZy6Yl4w-dMFRY96Q0XBjx24DAGGdsYtN0YJfuWBfKYt_BGW77pphlw3ijpL3JGhx_8UhAx-6BcXKIE-HQNGIdS06Fd2v9jNydg";

export const PROJECTS: Project[] = [
  {
    id: 'lumina-residence',
    title: "Резиденция 'Lumina'",
    subtitle: "Гиперреалистичная визуализация современного пентхауса",
    description: "Гиперреалистичная визуализация современного пентхауса с акцентом на естественное освещение и текстуры материалов.",
    fullDescription: "Проект высококлассной жилой недвижимости премиум-сегмента. Главная цель — воссоздать баланс естественного дневного света, панорамных видов на мегаполис и физически точной микротекстуры камня, натурального дерева и велюра. Сцена оптимизирована под реальное время в Unreal Engine 5 с применением технологий Lumen и Nanite.",
    category: 'Интерьеры',
    tags: ['Интерьеры', 'Unreal Engine 5'],
    imageUrl: "https://lh3.googleusercontent.com/aida/AP1WRLv5p6CJ3a2aEIdwCrqMvXgiw5PAppCmCXxatAkYzeAhSDzdXCihEh673cTltZBB5Y-dkIh4TPuIfONDDY7D-woJ2QA19GNekgFegysWJpwYI5Ysb9M5UiyT5NHzZtpHKriKUXUYOoWqVzCS1wVOn0eXYHGeJADzo5LsULKWUoxt18AWOfK_r06mOT7rqfR_Nf4qt1orC9XwxvEC7zwyzzrlTOKRVKZZxxbe6r6MynobWMbFRb1bIjqXBgyY",
    secondaryImageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    specs: {
      software: ['3ds Max', 'Corona Render', 'Unreal Engine 5', 'Substance Designer'],
      polygons: '4.8M Triangles',
      renderTime: 'Real-time (60 FPS @ 4K)',
      engine: 'Unreal Engine 5.4 (Lumen & Nanite)',
      year: '2024',
      client: 'Lumina Architecture Group'
    },
    featured: true
  },
  {
    id: 'cyberpunk-arsenal',
    title: "Киберпанк Арсенал",
    subtitle: "Серия высокодетализированного оружия для sci-fi шутера",
    description: "Серия высокодетализированного оружия для sci-fi шутера, оптимизированная для real-time рендеринга.",
    fullDescription: "Пакет игровых ассетов KINETIC-7 'STORM' для AAA киберпанк экшена. Включает полную PBR текстуризацию с 4K разрешениями, детективную сетку повреждений, кастомную анимацию перезарядки и процедурный износ поверхностей. Оптимизирован под жёсткие полигональные бюджеты современности.",
    category: 'Game Dev',
    tags: ['Game Dev', 'Hard Surface'],
    imageUrl: "https://lh3.googleusercontent.com/aida/AP1WRLu7B4fHl9UtYYDcPFlKDrE6VlMPS1u1u4mdNcHshyswt6QDfR7sb2CTsxrP__B5HZinVMg-uZrjQq_R20_hdhsPxThvHHVuwil1WqyWmEPj5Ri8kgy8LxkQmsXhY2z1Ec46aUgHCHNwBLhnJJjplEzrrMR_rgtK0OdJoeoKH7Ghgs4AW5dmwU0C5PhXvP9zyK9RcAlNE3lTjM9JzdLjfinb5isSupf9xsDWlXi8bp1sFgiMaRd6yi6GMVxx",
    secondaryImageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80",
    specs: {
      software: ['Blender', 'Marmoset Toolbag', 'Substance Painter', 'ZBrush'],
      polygons: '48.5K Triangles (Low-Poly)',
      renderTime: 'Real-time (120+ FPS)',
      engine: 'PBR Specular / Metallic Workflows',
      year: '2024',
      client: 'Indie Game Studio Alpha'
    },
    featured: true
  },
  {
    id: 'neo-tokyo-district',
    title: "Неоновый Квартал 2099",
    subtitle: "Пространственное окружение для sci-fi метавселенной",
    description: "Модульный конструктор окружения киберпанк города с интерактивным неоновым освещением и дождевыми поверхностями.",
    fullDescription: "Набор из 120+ процедурных конструктивных элементов для создания футуристических улиц. Поддерживает динамическую смену погоды, отражения SSR, объемный туман и физически корректные вывески на голографической основе.",
    category: 'Unreal Engine 5',
    tags: ['Unreal Engine 5', 'Game Dev'],
    imageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80",
    secondaryImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
    specs: {
      software: ['Blender', 'Unreal Engine 5', 'Houdini', 'Substance Designer'],
      polygons: '12.4M Triangles',
      renderTime: 'Real-time (80 FPS)',
      engine: 'Unreal Engine 5',
      year: '2024',
      client: 'MetaVerse VR'
    },
    featured: false
  },
  {
    id: 'industrial-exoskeleton',
    title: "Экзоскелет MK-IV",
    subtitle: "High-Poly концепт промышленной робототехники",
    description: "Детализированная 3D-модель автономного нагрузочного экзоскелета с гидравликой и проводной системой.",
    fullDescription: "Концептуальный дизайн робототехники для научных и индустриальных презентаций. Модель разработана методом кинематического hard-surface моделирования с точной расстановкой сочленений, поршней и гидравлических элементов.",
    category: 'Hard Surface',
    tags: ['Hard Surface', 'Game Dev'],
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
    specs: {
      software: ['Fusion 360', 'ZBrush', 'KeyShot', 'Substance Painter'],
      polygons: '850K Triangles',
      renderTime: 'Real-time PBR',
      engine: 'Marmoset Toolbag 4',
      year: '2023',
      client: 'RoboTech Industries'
    },
    featured: false
  },
  {
    id: 'minimalist-villa',
    title: "Вилла 'Aethel'",
    subtitle: "Архитектурный концепт загородной виллы в лесу",
    description: "Современный минималистичный дом из бетона и стекла с интегрированным пейзажным бассейном.",
    fullDescription: "Проект загородной резиденции на рельефном участке. Особый акцент сделан на световой дизайн в сумерках, интеграцию зеленых насаждений и фотореалистичную атмосферу туманного утра.",
    category: 'Архитектура',
    tags: ['Архитектура', 'Интерьеры'],
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
    specs: {
      software: ['Cinema 4D', 'Redshift', 'SpeedTree', 'Photoshop'],
      polygons: '6.2M Triangles',
      renderTime: '4 mins per frame @ 4K',
      engine: 'Redshift GPU Render',
      year: '2024',
      client: 'Nordic Horizon Living'
    },
    featured: false
  }
];

export const SERVICES: Service[] = [
  {
    id: 'interior-design',
    icon: 'architecture',
    title: "3D Дизайн интерьеров",
    description: "Создаем фотореалистичные визуализации жилых и коммерческих пространств, помогая увидеть проект еще до начала строительства.",
    features: [
      'Фотореалистичные ракурсы (4K UHD)',
      'Интерактивные 360° VR-панорамы',
      'Точный подбор мебели и материалов',
      'Световой дизайн и сумеречные сценарии'
    ],
    startingPrice: 'от 1 200 ₽ / м²',
    estimatedDays: '3-7 рабочих дней'
  },
  {
    id: 'game-assets',
    icon: 'sports_esports',
    title: "Создание игровых ассетов",
    description: "Разрабатываем пропсы, окружение и персонажей любой сложности (от low-poly до AAA) с полной PBR-настройкой материалов.",
    features: [
      'High-Poly / Low-Poly моделирование',
      'Запечка карт (Normal, AO, Curvature)',
      'Текстурирование в Substance (4K PBR)',
      'Готовая оптимизация для UE5 / Unity'
    ],
    startingPrice: 'от 25 000 ₽ / ассет',
    estimatedDays: '2-5 рабочих дней'
  },
  {
    id: 'game-mods',
    icon: 'extension',
    title: "Кастомные моды для игр",
    description: "Проектируем и интегрируем пользовательские модификации для популярных игровых движков, расширяя функционал и визуал.",
    features: [
      'Кастомный 3D контент и скины',
      'Интеграция в движки (UE5, Source 2, Unity)',
      'Кастомный UI и анимационные пайплайны',
      'Тестирование производительности'
    ],
    startingPrice: 'от 40 000 ₽ / мод',
    estimatedDays: '5-14 рабочих дней'
  }
];

export const TECH_STACK: TechItem[] = [
  {
    name: "Blender / Cinema 4D",
    percentage: 95,
    description: "Основной инструментарий для high-poly моделирования, процедурного анимационного дизайна и подготовки сцен."
  },
  {
    name: "Unreal Engine 5",
    percentage: 88,
    description: "Среда интерактивной визуализации real-time, Lumen lighting, Nanite geometry и виртуальной продакшн-студии."
  },
  {
    name: "Substance Painter",
    percentage: 92,
    description: "Физически корректное текстурирование PBR (Metallic/Roughness) с процедурной имитацией грязи и износа."
  },
  {
    name: "ZBrush / Houdini",
    percentage: 85,
    description: "Органический скульптуринг высокой детализации и процедуры симуляции частиц, разрушений и сложных физических сред."
  }
];
