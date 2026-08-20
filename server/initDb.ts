import bcrypt from 'bcryptjs';
import db from './db.js';

const defaultSettings = [
  { key: 'contactEmail', value: 'hello@artavenue.com' },
  { key: 'contactAddress', value: 'Москва, Кутузовский пр-т, 12' },
  { key: 'linkBehance', value: 'https://behance.net' },
  { key: 'linkInstagram', value: 'https://instagram.com' },
  { key: 'linkVimeo', value: 'https://vimeo.com' }
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

    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

init();
