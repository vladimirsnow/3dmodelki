import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const databasePath = path.join(projectRoot, 'database.sqlite');
const sourceBaseUrl = (process.env.PRODUCTION_API_BASE_URL || 'https://artavenue.studio').replace(/\/+$/, '');

async function fetchJson(endpoint) {
  const url = `${sourceBaseUrl}${endpoint}`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${endpoint} returned ${response.status}: ${body.slice(0, 200)}`);
  }

  return response.json();
}

function ensureSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt DATETIME
    );

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
      createdAt DATETIME,
      updatedAt DATETIME
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      icon TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      features TEXT NOT NULL,
      startingPrice TEXT NOT NULL,
      estimatedDays TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tech_stack (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      percentage INTEGER NOT NULL,
      description TEXT NOT NULL
    );
  `);

  ensureColumn(db, 'settings', 'updatedAt', 'DATETIME');
  ensureColumn(db, 'projects', 'createdAt', 'DATETIME');
  ensureColumn(db, 'projects', 'updatedAt', 'DATETIME');

  db.exec(`
    UPDATE settings SET updatedAt = CURRENT_TIMESTAMP WHERE updatedAt IS NULL;
    UPDATE projects SET createdAt = CURRENT_TIMESTAMP WHERE createdAt IS NULL;
    UPDATE projects SET updatedAt = CURRENT_TIMESTAMP WHERE updatedAt IS NULL;
  `);
}

function ensureColumn(db, table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((item) => item.name);
  if (!columns.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function requireArray(name, value) {
  if (!Array.isArray(value)) {
    throw new Error(`${name} endpoint did not return an array`);
  }
  return value;
}

function requireObject(name, value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${name} endpoint did not return an object`);
  }
  return value;
}

function projectRow(project) {
  const specs = project.specs || {};
  const software = Array.isArray(specs.software)
    ? specs.software
    : Array.isArray(project.specsSoftware)
      ? project.specsSoftware
      : [];

  return {
    id: String(project.id),
    title: String(project.title || ''),
    subtitle: project.subtitle ? String(project.subtitle) : '',
    description: String(project.description || ''),
    fullDescription: project.fullDescription ? String(project.fullDescription) : '',
    category: String(project.category || ''),
    tags: JSON.stringify(Array.isArray(project.tags) ? project.tags : []),
    imageUrl: String(project.imageUrl || ''),
    secondaryImageUrl: project.secondaryImageUrl ? String(project.secondaryImageUrl) : null,
    modelUrl: project.modelUrl ? String(project.modelUrl) : null,
    featured: project.featured ? 1 : 0,
    specsSoftware: JSON.stringify(software),
    specsPolygons: String(specs.polygons || project.specsPolygons || ''),
    specsRenderTime: String(specs.renderTime || project.specsRenderTime || ''),
    specsEngine: String(specs.engine || project.specsEngine || ''),
    specsYear: String(specs.year || project.specsYear || ''),
    specsClient: specs.client || project.specsClient ? String(specs.client || project.specsClient) : null,
  };
}

function serviceRow(service) {
  return {
    id: String(service.id),
    icon: String(service.icon || ''),
    title: String(service.title || ''),
    description: String(service.description || ''),
    features: JSON.stringify(Array.isArray(service.features) ? service.features : []),
    startingPrice: String(service.startingPrice || ''),
    estimatedDays: String(service.estimatedDays || ''),
  };
}

function techRow(item, index) {
  return {
    id: Number(item.id || index + 1),
    name: String(item.name || ''),
    percentage: Number(item.percentage || 0),
    description: String(item.description || ''),
  };
}

function deleteMissing(db, table, column, values) {
  if (values.length === 0) {
    db.prepare(`DELETE FROM ${table}`).run();
    return;
  }

  const placeholders = values.map(() => '?').join(',');
  db.prepare(`DELETE FROM ${table} WHERE ${column} NOT IN (${placeholders})`).run(...values);
}

async function main() {
  console.log(`Syncing local SQLite from ${sourceBaseUrl}`);

  const [settings, projects, services, techStack] = await Promise.all([
    fetchJson('/api/settings').then((value) => requireObject('settings', value)),
    fetchJson('/api/projects').then((value) => requireArray('projects', value)),
    fetchJson('/api/services').then((value) => requireArray('services', value)),
    fetchJson('/api/tech_stack').then((value) => requireArray('tech_stack', value)),
  ]);

  const db = new Database(databasePath);
  ensureSchema(db);

  const sync = db.transaction(() => {
    const settingEntries = Object.entries(settings).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
    }));
    const settingKeys = settingEntries.map((item) => item.key);

    const upsertSetting = db.prepare(`
      INSERT INTO settings (key, value, updatedAt)
      VALUES (@key, @value, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updatedAt = CURRENT_TIMESTAMP
    `);
    for (const setting of settingEntries) {
      upsertSetting.run(setting);
    }
    deleteMissing(db, 'settings', 'key', settingKeys);

    const projectRows = projects.map(projectRow);
    const projectIds = projectRows.map((item) => item.id);
    const upsertProject = db.prepare(`
      INSERT INTO projects (
        id, title, subtitle, description, fullDescription, category, tags,
        imageUrl, secondaryImageUrl, modelUrl, featured,
        specsSoftware, specsPolygons, specsRenderTime, specsEngine, specsYear, specsClient,
        createdAt, updatedAt
      )
      VALUES (
        @id, @title, @subtitle, @description, @fullDescription, @category, @tags,
        @imageUrl, @secondaryImageUrl, @modelUrl, @featured,
        @specsSoftware, @specsPolygons, @specsRenderTime, @specsEngine, @specsYear, @specsClient,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        subtitle = excluded.subtitle,
        description = excluded.description,
        fullDescription = excluded.fullDescription,
        category = excluded.category,
        tags = excluded.tags,
        imageUrl = excluded.imageUrl,
        secondaryImageUrl = excluded.secondaryImageUrl,
        modelUrl = excluded.modelUrl,
        featured = excluded.featured,
        specsSoftware = excluded.specsSoftware,
        specsPolygons = excluded.specsPolygons,
        specsRenderTime = excluded.specsRenderTime,
        specsEngine = excluded.specsEngine,
        specsYear = excluded.specsYear,
        specsClient = excluded.specsClient,
        updatedAt = CURRENT_TIMESTAMP
    `);
    for (const project of projectRows) {
      upsertProject.run(project);
    }
    deleteMissing(db, 'projects', 'id', projectIds);

    const serviceRows = services.map(serviceRow);
    const serviceIds = serviceRows.map((item) => item.id);
    const upsertService = db.prepare(`
      INSERT INTO services (id, icon, title, description, features, startingPrice, estimatedDays)
      VALUES (@id, @icon, @title, @description, @features, @startingPrice, @estimatedDays)
      ON CONFLICT(id) DO UPDATE SET
        icon = excluded.icon,
        title = excluded.title,
        description = excluded.description,
        features = excluded.features,
        startingPrice = excluded.startingPrice,
        estimatedDays = excluded.estimatedDays
    `);
    for (const service of serviceRows) {
      upsertService.run(service);
    }
    deleteMissing(db, 'services', 'id', serviceIds);

    const techRows = techStack.map(techRow);
    const techIds = techRows.map((item) => item.id);
    const upsertTech = db.prepare(`
      INSERT INTO tech_stack (id, name, percentage, description)
      VALUES (@id, @name, @percentage, @description)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        percentage = excluded.percentage,
        description = excluded.description
    `);
    for (const item of techRows) {
      upsertTech.run(item);
    }
    deleteMissing(db, 'tech_stack', 'id', techIds);
  });

  sync();
  db.close();

  console.log(`Synced ${projects.length} projects, ${services.length} services, ${techStack.length} tech items and ${Object.keys(settings).length} settings.`);
}

main().catch((error) => {
  console.error(`Production sync failed: ${error.message}`);
  process.exit(1);
});
