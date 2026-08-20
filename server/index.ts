import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB schema
import './initDb.js';

const app = express();
const PORT = process.env.PORT || 3001;

// --- SECURITY: JWT secret MUST come from environment variable ---
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('⚠️  ВНИМАНИЕ: JWT_SECRET не задан или слишком короткий! Создайте файл .env с надёжным ключом.');
  console.error('   Пример: JWT_SECRET=ваша_случайная_строка_минимум_32_символа');
  // Fallback for development only
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}
const SECRET = JWT_SECRET || 'dev_only_fallback_key_not_for_production_use_32chars!';

// --- SECURITY: Rate limiting for login (brute force protection) ---
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  
  if (!record || (now - record.lastAttempt) > LOGIN_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    return false; // blocked
  }
  
  record.count++;
  record.lastAttempt = now;
  return true;
}

function resetRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

// Clean up old entries every 30 min
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of loginAttempts) {
    if (now - record.lastAttempt > LOGIN_WINDOW_MS) {
      loginAttempts.delete(ip);
    }
  }
}, 30 * 60 * 1000);

// --- MIDDLEWARE ---
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [] // No CORS in production (same origin)
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' })); // Limit request body size
app.use(cookieParser());

// --- SECURITY HEADERS ---
app.use((req, res, next) => {
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Static file serving for uploads
const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// --- SECURITY: Multer config with file type validation ---
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const ALLOWED_MODEL_TYPES = ['model/gltf-binary', 'application/octet-stream']; // .glb files
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.glb'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename - remove path traversal characters
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(safeName).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error(`Недопустимый тип файла: ${ext}. Разрешены: ${ALLOWED_EXTENSIONS.join(', ')}`));
    }
    cb(null, true);
  }
});

// --- SECURITY: Input sanitization helper ---
function sanitize(input: any, maxLength = 5000): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

// --- AUTH MIDDLEWARE ---
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.cookies.admin_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.clearCookie('admin_token');
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// --- AUTH ROUTES ---
app.post('/api/auth/login', (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  // Rate limit check
  if (!checkRateLimit(ip)) {
    const remaining = Math.ceil(LOGIN_WINDOW_MS / 60000);
    return res.status(429).json({ 
      error: `Слишком много попыток входа. Попробуйте через ${remaining} минут.` 
    });
  }

  const username = sanitize(req.body.username, 100);
  const password = sanitize(req.body.password, 200);
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username) as any;
  if (!admin) {
    // Use generic error to prevent username enumeration
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }

  const isMatch = bcrypt.compareSync(password, admin.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }

  // Successful login - reset rate limit
  resetRateLimit(ip);

  const token = jwt.sign(
    { id: admin.id, username: admin.username }, 
    SECRET, 
    { expiresIn: '8h' } // Reduced from 24h for security
  );
  
  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
    path: '/'
  });

  res.json({ message: 'Logged in successfully', user: { username: admin.username } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('admin_token', { path: '/' });
  res.json({ message: 'Logged out' });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: (req as any).user });
});

// --- SETTINGS ROUTES ---
app.get('/api/settings', (req, res) => {
  const settings = db.prepare('SELECT * FROM settings').all() as any[];
  const result = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
  res.json(result);
});

app.put('/api/settings', requireAuth, (req, res) => {
  const updates = req.body;
  
  // Validate: only accept string key-value pairs
  if (typeof updates !== 'object' || Array.isArray(updates)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }
  
  const stmt = db.prepare('UPDATE settings SET value = ? WHERE key = ?');
  const insertStmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  
  const transaction = db.transaction((updates: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(updates)) {
      const safeKey = sanitize(key, 200);
      const safeValue = sanitize(String(value), 10000);
      const info = stmt.run(safeValue, safeKey);
      if (info.changes === 0) {
        insertStmt.run(safeKey, safeValue);
      }
    }
  });

  try {
    transaction(updates);
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// --- PROJECTS ROUTES ---
app.get('/api/projects', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects').all() as any[];
  const parsed = projects.map(p => ({
    ...p,
    tags: JSON.parse(p.tags),
    specsSoftware: JSON.parse(p.specsSoftware),
    featured: p.featured === 1,
    specs: {
      software: JSON.parse(p.specsSoftware),
      polygons: p.specsPolygons,
      renderTime: p.specsRenderTime,
      engine: p.specsEngine,
      year: p.specsYear,
      client: p.specsClient
    }
  }));
  res.json(parsed);
});

app.put('/api/projects/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const data = req.body;
  
  try {
    db.prepare(`
      UPDATE projects SET 
        title = @title, subtitle = @subtitle, description = @description,
        fullDescription = @fullDescription, category = @category, tags = @tags,
        imageUrl = @imageUrl, secondaryImageUrl = @secondaryImageUrl, modelUrl = @modelUrl,
        featured = @featured, specsSoftware = @specsSoftware, specsPolygons = @specsPolygons,
        specsRenderTime = @specsRenderTime, specsEngine = @specsEngine, specsYear = @specsYear,
        specsClient = @specsClient
      WHERE id = @id
    `).run({
      id: sanitize(id, 100),
      title: sanitize(data.title),
      subtitle: sanitize(data.subtitle),
      description: sanitize(data.description),
      fullDescription: sanitize(data.fullDescription, 10000),
      category: sanitize(data.category),
      tags: JSON.stringify(data.tags),
      imageUrl: sanitize(data.imageUrl, 500),
      secondaryImageUrl: sanitize(data.secondaryImageUrl, 500) || null,
      modelUrl: sanitize(data.modelUrl, 500) || null,
      featured: data.featured ? 1 : 0,
      specsSoftware: JSON.stringify(data.specs?.software || []),
      specsPolygons: sanitize(data.specs?.polygons),
      specsRenderTime: sanitize(data.specs?.renderTime),
      specsEngine: sanitize(data.specs?.engine),
      specsYear: sanitize(data.specs?.year),
      specsClient: sanitize(data.specs?.client) || null
    });
    res.json({ message: 'Project updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// --- SERVICES ROUTES ---
app.get('/api/services', (req, res) => {
  const services = db.prepare('SELECT * FROM services').all() as any[];
  const parsed = services.map(s => ({
    ...s,
    features: JSON.parse(s.features)
  }));
  res.json(parsed);
});

app.put('/api/services/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        db.prepare(`
            UPDATE services SET
                title = @title, description = @description, features = @features,
                startingPrice = @startingPrice, estimatedDays = @estimatedDays, icon = @icon
            WHERE id = @id
        `).run({
            id: sanitize(id, 100),
            title: sanitize(data.title),
            description: sanitize(data.description),
            features: JSON.stringify(data.features),
            startingPrice: sanitize(data.startingPrice),
            estimatedDays: sanitize(data.estimatedDays),
            icon: sanitize(data.icon, 100)
        });
        res.json({ message: 'Service updated' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update service' });
    }
});

// --- TECH STACK ROUTES ---
app.get('/api/tech_stack', (req, res) => {
  const tech = db.prepare('SELECT * FROM tech_stack').all();
  res.json(tech);
});

// --- UPLOAD ROUTE ---
app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// --- SECURITY: Global error handler (don't leak stack traces) ---
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err.message);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});
