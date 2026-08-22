import bcrypt from 'bcryptjs';
import db from './db.js';

const defaultSettings = [
  { key: 'contactEmail', value: 'hello@artavenue.com' },
  { key: 'contactAddress', value: 'Алматы / Онлайн' },
  { key: 'linkBehance', value: 'https://behance.net' },
  { key: 'linkInstagram', value: 'https://instagram.com' },
  { key: 'linkVimeo', value: 'https://vimeo.com' },
  { key: 'telegramChatIds', value: '["6778470996"]' }
];

const defaultProjects = [
  {
    id: 'lumina-residence',
    title: "Резиденция 'Lumina'",
    subtitle: 'Гиперреалистичная визуализация современного пентхауса',
    description: 'Гиперреалистичная визуализация современного пентхауса с акцентом на естественное освещение и текстуры материалов.',
    fullDescription: 'Проект высококлассной жилой недвижимости премиум-сегмента. Главная цель — воссоздать баланс естественного дневного света, панорамных видов на мегаполис и физически точной микротекстуры камня, натурального дерева и велюра. Сцена оптимизирована под реальное время в Unreal Engine 5 с применением технологий Lumen и Nanite.',
    category: 'Интерьеры',
    tags: JSON.stringify(['Интерьеры', 'Unreal Engine 5']),
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
    secondaryImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    modelUrl: null,
    featured: 1,
    specsSoftware: JSON.stringify(['3ds Max', 'Corona Render', 'Unreal Engine 5', 'Substance Designer']),
    specsPolygons: '4.8M Triangles',
    specsRenderTime: 'Real-time (60 FPS @ 4K)',
    specsEngine: 'Unreal Engine 5.4 (Lumen & Nanite)',
    specsYear: '2024',
    specsClient: 'Lumina Architecture Group'
  },
  {
    id: 'cyberpunk-arsenal',
    title: 'Киберпанк Арсенал',
    subtitle: 'Серия высокодетализированного оружия для sci-fi шутера',
    description: 'Серия высокодетализированного оружия для sci-fi шутера, оптимизированная для real-time рендеринга.',
    fullDescription: 'Пакет игровых ассетов KINETIC-7 "STORM" для AAA киберпанк экшена. Включает полную PBR текстуризацию с 4K разрешениями, детективную сетку повреждений, кастомную анимацию перезарядки и процедурный износ поверхностей. Оптимизирован под жёсткие полигональные бюджеты современности.',
    category: 'Game Dev',
    tags: JSON.stringify(['Game Dev', 'Hard Surface']),
    imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1600&q=80',
    secondaryImageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=1600&q=80',
    modelUrl: null,
    featured: 1,
    specsSoftware: JSON.stringify(['Blender', 'Marmoset Toolbag', 'Substance Painter', 'ZBrush']),
    specsPolygons: '48.5K Triangles (Low-Poly)',
    specsRenderTime: 'Real-time (120+ FPS)',
    specsEngine: 'PBR Specular / Metallic Workflows',
    specsYear: '2024',
    specsClient: 'Indie Game Studio Alpha'
  },
  {
    id: 'neo-tokyo-district',
    title: 'Неоновый Квартал 2099',
    subtitle: 'Пространственное окружение для sci-fi метавселенной',
    description: 'Модульный конструктор окружения киберпанк города с интерактивным неоновым освещением и дождевыми поверхностями.',
    fullDescription: 'Набор из 120+ процедурных конструктивных элементов для создания футуристических улиц. Поддерживает динамическую смену погоды, отражения SSR, объемный туман и физически корректные вывески на голографической основе.',
    category: 'Unreal Engine 5',
    tags: JSON.stringify(['Unreal Engine 5', 'Game Dev']),
    imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
    secondaryImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    modelUrl: null,
    featured: 0,
    specsSoftware: JSON.stringify(['Blender', 'Unreal Engine 5', 'Houdini', 'Substance Designer']),
    specsPolygons: '12.4M Triangles',
    specsRenderTime: 'Real-time (80 FPS)',
    specsEngine: 'Unreal Engine 5',
    specsYear: '2024',
    specsClient: 'MetaVerse VR'
  },
  {
    id: 'industrial-exoskeleton',
    title: 'Экзоскелет MK-IV',
    subtitle: 'High-Poly концепт промышленной робототехники',
    description: 'Детализированная 3D-модель автономного нагрузочного экзоскелета с гидравликой и проводной системой.',
    fullDescription: 'Концептуальный дизайн робототехники для научных и индустриальных презентаций. Модель разработана методом кинематического hard-surface моделирования с точной расстановкой сочленений, поршней и гидравлических элементов.',
    category: 'Hard Surface',
    tags: JSON.stringify(['Hard Surface', 'Game Dev']),
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    secondaryImageUrl: null,
    modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    featured: 0,
    specsSoftware: JSON.stringify(['Fusion 360', 'ZBrush', 'KeyShot', 'Substance Painter']),
    specsPolygons: '850K Triangles',
    specsRenderTime: 'Real-time PBR',
    specsEngine: 'Marmoset Toolbag 4',
    specsYear: '2023',
    specsClient: 'RoboTech Industries'
  },
  {
    id: 'minimalist-villa',
    title: "Вилла 'Aethel'",
    subtitle: 'Архитектурный концепт загородной виллы в лесу',
    description: 'Современный минималистичный дом из бетона и стекла с интегрированным пейзажным бассейном.',
    fullDescription: 'Проект загородной резиденции на рельефном участке. Особый акцент сделан на световой дизайн в сумерках, интеграцию зеленых насаждений и фотореалистичную атмосферу туманного утра.',
    category: 'Архитектура',
    tags: JSON.stringify(['Архитектура', 'Интерьеры']),
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
    secondaryImageUrl: null,
    modelUrl: null,
    featured: 0,
    specsSoftware: JSON.stringify(['Cinema 4D', 'Redshift', 'SpeedTree', 'Photoshop']),
    specsPolygons: '6.2M Triangles',
    specsRenderTime: '4 mins per frame @ 4K',
    specsEngine: 'Redshift GPU Render',
    specsYear: '2024',
    specsClient: 'Nordic Horizon Living'
  }
];

const defaultServices = [
  {
    id: 'interior-design',
    icon: 'architecture',
    title: '3D Дизайн интерьеров',
    description: 'Создаем фотореалистичные визуализации жилых и коммерческих пространств, помогая увидеть проект еще до начала строительства.',
    features: JSON.stringify(['Фотореалистичные ракурсы (4K UHD)', 'Интерактивные 360° VR-панорамы', 'Точный подбор мебели и материалов', 'Световой дизайн и сумеречные сценарии']),
    startingPrice: 'от 1 200 ₽ / м²',
    estimatedDays: '3-7 рабочих дней'
  },
  {
    id: 'game-assets',
    icon: 'sports_esports',
    title: 'Создание игровых ассетов',
    description: 'Разрабатываем пропсы, окружение и персонажей любой сложности (от low-poly до AAA) с полной PBR-настройкой материалов.',
    features: JSON.stringify(['High-Poly / Low-Poly моделирование', 'Запечка карт (Normal, AO, Curvature)', 'Текстурирование в Substance (4K PBR)', 'Готовая оптимизация для UE5 / Unity']),
    startingPrice: 'от 25 000 ₽ / ассет',
    estimatedDays: '2-5 рабочих дней'
  },
  {
    id: 'game-mods',
    icon: 'extension',
    title: 'Кастомные моды для игр',
    description: 'Проектируем и интегрируем пользовательские модификации для популярных игровых движков, расширяя функционал и визуал.',
    features: JSON.stringify(['Кастомный 3D контент и скины', 'Интеграция в движки (UE5, Source 2, Unity)', 'Кастомный UI и анимационные пайплайны', 'Тестирование производительности']),
    startingPrice: 'от 40 000 ₽ / мод',
    estimatedDays: '5-14 рабочих дней'
  }
];

const defaultTechStack = [
  { name: 'Blender / Cinema 4D', percentage: 95, description: 'Основной инструментарий для high-poly моделирования, процедурного анимационного дизайна и подготовки сцен.' },
  { name: 'Unreal Engine 5', percentage: 88, description: 'Среда интерактивной визуализации real-time, Lumen lighting, Nanite geometry и виртуальной продакшн-студии.' },
  { name: 'Substance Painter', percentage: 92, description: 'Физически корректное текстурирование PBR (Metallic/Roughness) с процедурной имитацией грязи и износа.' },
  { name: 'ZBrush / Houdini', percentage: 85, description: 'Органический скульптуринг высокой детализации и процедуры симуляции частиц, разрушений и сложных физических сред.' }
];

async function init() {
  try {
    // Admins table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Projects table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT NOT NULL,
        fullDescription TEXT,
        category TEXT NOT NULL,
        tags TEXT NOT NULL,
        imageUrl TEXT NOT NULL,
        secondaryImageUrl TEXT,
        modelUrl TEXT,
        featured INTEGER DEFAULT 0,
        specsSoftware TEXT NOT NULL,
        specsPolygons TEXT,
        specsRenderTime TEXT,
        specsEngine TEXT,
        specsYear TEXT,
        specsClient TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Services table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        icon TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        features TEXT NOT NULL,
        startingPrice TEXT NOT NULL,
        estimatedDays TEXT NOT NULL
      )
    `);

    // Tech Stack table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tech_stack (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        percentage INTEGER NOT NULL,
        description TEXT NOT NULL
      )
    `);

    // Seed default admin if none exists
    const adminCheck = await db.execute("SELECT COUNT(*) as count FROM admins");
    if (adminCheck.rows[0].count === 0) {
      const hash = bcrypt.hashSync('3dmodelki', 10);
      await db.execute({
        sql: "INSERT INTO admins (username, passwordHash) VALUES (?, ?)",
        args: ['admin', hash]
      });
      console.log('Default admin created.');
    }

    // Seed default settings
    for (const s of defaultSettings) {
      await db.execute({
        sql: "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
        args: [s.key, s.value]
      });
    }

    // Seed default projects if table is empty
    const projectCheck = await db.execute("SELECT COUNT(*) as count FROM projects");
    if (projectCheck.rows[0].count === 0) {
      for (const p of defaultProjects) {
        await db.execute({
          sql: `INSERT OR IGNORE INTO projects
            (id, title, subtitle, description, fullDescription, category, tags,
             imageUrl, secondaryImageUrl, modelUrl, featured,
             specsSoftware, specsPolygons, specsRenderTime, specsEngine, specsYear, specsClient)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          args: [
            p.id, p.title, p.subtitle, p.description, p.fullDescription,
            p.category, p.tags, p.imageUrl, p.secondaryImageUrl, p.modelUrl,
            p.featured, p.specsSoftware, p.specsPolygons, p.specsRenderTime,
            p.specsEngine, p.specsYear, p.specsClient
          ]
        });
      }
      console.log(`Seeded ${defaultProjects.length} default projects.`);
    }

    // Seed default services if table is empty
    const serviceCheck = await db.execute("SELECT COUNT(*) as count FROM services");
    if (serviceCheck.rows[0].count === 0) {
      for (const s of defaultServices) {
        await db.execute({
          sql: `INSERT OR IGNORE INTO services (id, icon, title, description, features, startingPrice, estimatedDays)
                VALUES (?,?,?,?,?,?,?)`,
          args: [s.id, s.icon, s.title, s.description, s.features, s.startingPrice, s.estimatedDays]
        });
      }
      console.log(`Seeded ${defaultServices.length} default services.`);
    }

    // Seed default tech stack if table is empty
    const techCheck = await db.execute("SELECT COUNT(*) as count FROM tech_stack");
    if (techCheck.rows[0].count === 0) {
      for (const t of defaultTechStack) {
        await db.execute({
          sql: `INSERT INTO tech_stack (name, percentage, description) VALUES (?,?,?)`,
          args: [t.name, t.percentage, t.description]
        });
      }
      console.log(`Seeded ${defaultTechStack.length} tech stack items.`);
    }

    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

init();
