import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../server/db.js';
import multer from 'multer';
import { put } from '@vercel/blob';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize DB schema asynchronously (fire and forget for local dev)
import '../server/initDb.js';

const app = express();
const PORT = process.env.PORT || 3001;

// --- SECURITY: JWT secret ---
const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_fallback_key_not_for_production_use_32chars!';

// --- SECURITY: Rate limiting (in-memory, resets on serverless cold start) ---
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || (now - record.lastAttempt) > LOGIN_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  if (record.count >= MAX_LOGIN_ATTEMPTS) return false;
  record.count++;
  record.lastAttempt = now;
  return true;
}

function resetRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

// --- MIDDLEWARE ---
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? [] : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// --- UPLOAD CONFIG FOR VERCEL BLOB ---
// Use memory storage so we can stream the buffer to Vercel Blob
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const ALLOWED = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.glb'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED.includes(ext)) {
      return cb(new Error(`Недопустимый тип файла: ${ext}`));
    }
    cb(null, true);
  }
});

function sanitize(input: any, maxLength = 5000): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.cookies.admin_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.clearCookie('admin_token');
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Слишком много попыток входа.' });
  }

  const username = sanitize(req.body.username, 100);
  const password = sanitize(req.body.password, 200);
  if (!username || !password) return res.status(400).json({ error: 'Required fields missing' });

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM admins WHERE username = ?',
      args: [username]
    });
    
    const admin = result.rows[0];
    if (!admin) return res.status(401).json({ error: 'Неверный логин или пароль' });

    const isMatch = bcrypt.compareSync(password, admin.passwordHash as string);
    if (!isMatch) return res.status(401).json({ error: 'Неверный логин или пароль' });

    resetRateLimit(ip);
    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });
    
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000,
      path: '/'
    });

    res.json({ message: 'Logged in successfully', user: { username: admin.username } });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('admin_token', { path: '/' });
  res.json({ message: 'Logged out' });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: (req as any).user });
});

// --- SETTINGS ROUTES ---
app.get('/api/settings', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM settings');
    const settings = result.rows.reduce((acc: any, curr) => {
      acc[curr.key as string] = curr.value;
      return acc;
    }, {});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'DB Error' });
  }
});

app.put('/api/settings', requireAuth, async (req, res) => {
  const updates = req.body;
  if (typeof updates !== 'object' || Array.isArray(updates)) return res.status(400).json({ error: 'Invalid data' });
  
  try {
    const queries = [];
    for (const [key, value] of Object.entries(updates)) {
      queries.push({
        sql: `INSERT INTO settings (key, value) VALUES (?, ?) 
              ON CONFLICT(key) DO UPDATE SET value=excluded.value, updatedAt=CURRENT_TIMESTAMP`,
        args: [sanitize(key, 200), sanitize(String(value), 10000)]
      });
    }
    // LibSQL supports batch transactions
    await db.batch(queries, 'write');
    res.json({ message: 'Settings updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// --- PROJECTS ROUTES ---
app.get('/api/projects', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM projects');
    const parsed = result.rows.map(p => ({
      ...p,
      tags: JSON.parse(p.tags as string),
      specsSoftware: JSON.parse(p.specsSoftware as string),
      featured: p.featured === 1,
      specs: {
        software: JSON.parse(p.specsSoftware as string),
        polygons: p.specsPolygons,
        renderTime: p.specsRenderTime,
        engine: p.specsEngine,
        year: p.specsYear,
        client: p.specsClient
      }
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'DB Error' });
  }
});

app.put('/api/projects/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  
  try {
    await db.execute({
      sql: `UPDATE projects SET 
        title = ?, subtitle = ?, description = ?,
        fullDescription = ?, category = ?, tags = ?,
        imageUrl = ?, secondaryImageUrl = ?, modelUrl = ?,
        featured = ?, specsSoftware = ?, specsPolygons = ?,
        specsRenderTime = ?, specsEngine = ?, specsYear = ?,
        specsClient = ?
      WHERE id = ?`,
      args: [
        sanitize(data.title), sanitize(data.subtitle), sanitize(data.description),
        sanitize(data.fullDescription, 10000), sanitize(data.category), JSON.stringify(data.tags),
        sanitize(data.imageUrl, 500), sanitize(data.secondaryImageUrl, 500) || null, sanitize(data.modelUrl, 500) || null,
        data.featured ? 1 : 0, JSON.stringify(data.specs?.software || []), sanitize(data.specs?.polygons),
        sanitize(data.specs?.renderTime), sanitize(data.specs?.engine), sanitize(data.specs?.year),
        sanitize(data.specs?.client) || null, sanitize(id, 100)
      ]
    });
    res.json({ message: 'Project updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// --- SERVICES ROUTES ---
app.get('/api/services', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM services');
    const parsed = result.rows.map(s => ({
      ...s,
      features: JSON.parse(s.features as string)
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'DB Error' });
  }
});

app.put('/api/services/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    await db.execute({
      sql: `UPDATE services SET
          title = ?, description = ?, features = ?,
          startingPrice = ?, estimatedDays = ?, icon = ?
      WHERE id = ?`,
      args: [
        sanitize(data.title), sanitize(data.description), JSON.stringify(data.features),
        sanitize(data.startingPrice), sanitize(data.estimatedDays), sanitize(data.icon, 100),
        sanitize(id, 100)
      ]
    });
    res.json({ message: 'Service updated' });
  } catch(err) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// --- TECH STACK ROUTES ---
app.get('/api/tech_stack', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM tech_stack');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB Error' });
  }
});

// --- TELEGRAM BOT LOGIC ---
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

async function sendTelegramMessage(chatId: string | number, text: string, replyMarkup?: any) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN not configured. Skipping message:', text);
    return;
  }
  try {
    const body: any = { chat_id: chatId, text, parse_mode: 'HTML' };
    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      console.error('Telegram API error:', await response.text());
    }
  } catch (err) {
    console.error('Failed to send Telegram message:', err);
  }
}

async function getTelegramUserInfo(chatId: string | number): Promise<string> {
  if (!TELEGRAM_BOT_TOKEN) return `<code>${chatId}</code>`;
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChat?chat_id=${chatId}`);
    if (response.ok) {
      const data = await response.json();
      if (data.ok && data.result) {
        const u = data.result;
        let name = '';
        if (u.first_name) name += u.first_name;
        if (u.last_name) name += ' ' + u.last_name;
        if (u.username) name += ` (@${u.username})`;
        if (name) {
          return `<code>${chatId}</code> (${sanitize(name.trim(), 100)})`;
        }
      }
    }
  } catch (err) {
    console.error('getChat error:', err);
  }
  return `<code>${chatId}</code>`;
}

// Contact form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, serviceType, budget, details } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    // 1. Get chat IDs and order counter from settings (with robust fallbacks)
    const settingsResult = await db.execute("SELECT key, value FROM settings WHERE key IN ('telegramChatIds', 'orderCounter')");
    
    let chatIds: string[] = ['6778470996']; // Fallback default
    let orderCounter = 0;

    for (const row of settingsResult.rows) {
      if (row.key === 'telegramChatIds') {
        try { 
          const val = JSON.parse(row.value as string);
          if (Array.isArray(val) && val.length > 0) chatIds = val;
        } catch (e) {}
      } else if (row.key === 'orderCounter') {
        orderCounter = parseInt(row.value as string, 10) || 0;
      }
    }

    // 2. Increment order counter
    const newOrderId = orderCounter + 1;
    await db.execute({
      sql: "INSERT INTO settings (key, value) VALUES ('orderCounter', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      args: [newOrderId.toString()]
    });

    // 3. Format message
    const message = `
🌟 <b>Заказ #${newOrderId}</b>

👤 <b>Имя:</b> ${sanitize(name, 100)}
📧 <b>Email:</b> ${sanitize(email, 100)}
📞 <b>Контакт:</b> ${phone ? sanitize(phone, 100) : '<i>Не указан</i>'}

📝 <b>Детали проекта:</b>
${sanitize(details || 'Нет деталей', 2000)}
    `.trim();

    // 4. Send to all subscribed managers
    for (const chatId of chatIds) {
      await sendTelegramMessage(chatId, message);
    }

    res.json({ success: true, message: 'Заявка отправлена' });
  } catch (err) {
    console.error('Contact submission error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Telegram Webhook for Bot commands
app.post('/api/telegram/webhook', async (req, res) => {
  const { message } = req.body;

  if (!message || !message.text) {
    return res.status(200).send('OK');
  }

  const chatId = message.chat.id.toString();
  const text = message.text.trim();

  try {
    const settingsResult = await db.execute("SELECT key, value FROM settings WHERE key IN ('telegramChatIds', 'telegramAdmins')");
    let chatIds: string[] = ['6778470996'];
    let adminIds: string[] = ['6778470996'];

    for (const row of settingsResult.rows) {
      if (row.key === 'telegramChatIds') {
        try {
          const val = JSON.parse(row.value as string);
          if (Array.isArray(val) && val.length > 0) chatIds = val;
        } catch (e) {}
      } else if (row.key === 'telegramAdmins') {
        try {
          const val = JSON.parse(row.value as string);
          if (Array.isArray(val) && val.length > 0) adminIds = val;
        } catch (e) {}
      }
    }

    const isAdmin = adminIds.includes(chatId);

    // Keyboard configuration for admins
    const adminKeyboard = {
      keyboard: [
        [{ text: '📋 Получатели' }, { text: '🔑 Админы' }],
        [{ text: '➕ Добавить получателя' }, { text: '➕ Добавить админа' }],
        [{ text: '➖ Удалить получателя' }, { text: '➖ Удалить админа' }]
      ],
      resize_keyboard: true
    };

    // Parse command from direct text OR from force-reply context
    let command = text;
    if (message.reply_to_message && message.reply_to_message.text) {
      const promptText = message.reply_to_message.text;
      if (promptText.includes('ID пользователя для добавления в получатели')) {
        command = `/add ${text}`;
      } else if (promptText.includes('ID администратора для добавления')) {
        command = `/addadmin ${text}`;
      } else if (promptText.includes('ID пользователя для удаления из получателей')) {
        command = `/remove ${text}`;
      } else if (promptText.includes('ID администратора для удаления')) {
        command = `/removeadmin ${text}`;
      }
    }

    if (command.startsWith('/start') || command === 'меню' || command === '/menu') {
      let reply = `Привет! Ваш Chat ID: <code>${chatId}</code>\n\n`;
      if (isAdmin) {
        reply += `Вы являетесь Администратором бота.\nИспользуйте клавиатуру ниже для управления.`;
        await sendTelegramMessage(chatId, reply, adminKeyboard);
      } else {
        reply += `Вы не зарегистрированы как администратор. Передайте ваш ID владельцу бота.`;
        await sendTelegramMessage(chatId, reply);
      }
    } 
    else if ((command === '📋 Получатели' || command.startsWith('/list')) && isAdmin) {
      const formatted = await Promise.all(chatIds.map(id => getTelegramUserInfo(id)));
      await sendTelegramMessage(chatId, `<b>Список получателей заявок:</b>\n\n${formatted.map(info => `• ${info}`).join('\n')}`, adminKeyboard);
    }
    else if ((command === '🔑 Админы' || command.startsWith('/listadmins')) && isAdmin) {
      const formatted = await Promise.all(adminIds.map(id => getTelegramUserInfo(id)));
      await sendTelegramMessage(chatId, `<b>Список администраторов бота:</b>\n\n${formatted.map(info => `• ${info}`).join('\n')}`, adminKeyboard);
    }
    // BUTTON PROMPTS (Force Reply)
    else if (command === '➕ Добавить получателя' && isAdmin) {
      await sendTelegramMessage(chatId, `Пожалуйста, отправьте ID пользователя для добавления в получатели:`, { force_reply: true, selective: true });
    }
    else if (command === '➕ Добавить админа' && isAdmin) {
      await sendTelegramMessage(chatId, `Пожалуйста, отправьте ID администратора для добавления:`, { force_reply: true, selective: true });
    }
    else if (command === '➖ Удалить получателя' && isAdmin) {
      await sendTelegramMessage(chatId, `Пожалуйста, отправьте ID пользователя для удаления из получателей:`, { force_reply: true, selective: true });
    }
    else if (command === '➖ Удалить админа' && isAdmin) {
      await sendTelegramMessage(chatId, `Пожалуйста, отправьте ID администратора для удаления:`, { force_reply: true, selective: true });
    }
    // COMMAND EXECUTIONS
    else if (command.startsWith('/add ') && isAdmin) {
      const newId = command.split(' ')[1];
      if (newId && !isNaN(Number(newId))) {
        if (!chatIds.includes(newId)) {
          chatIds.push(newId);
          await db.execute({
            sql: "INSERT INTO settings (key, value) VALUES ('telegramChatIds', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            args: [JSON.stringify(chatIds)]
          });
          await sendTelegramMessage(chatId, `✅ ID ${newId} успешно добавлен в список получателей заявок.`, adminKeyboard);
          await sendTelegramMessage(newId, `Вы были добавлены в список получателей заявок на сайте.`);
        } else {
          await sendTelegramMessage(chatId, `⚠️ Этот ID уже есть в списке получателей.`, adminKeyboard);
        }
      } else {
        await sendTelegramMessage(chatId, `❌ Неверный формат ID. Нужны только цифры.`, adminKeyboard);
      }
    }
    else if (command.startsWith('/remove ') && isAdmin) {
      const rmId = command.split(' ')[1];
      if (chatIds.includes(rmId)) {
        chatIds = chatIds.filter(id => id !== rmId);
        await db.execute({
          sql: "INSERT INTO settings (key, value) VALUES ('telegramChatIds', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
          args: [JSON.stringify(chatIds)]
        });
        await sendTelegramMessage(chatId, `✅ ID ${rmId} удален из получателей.`, adminKeyboard);
      } else {
        await sendTelegramMessage(chatId, `⚠️ ID не найден в списке получателей.`, adminKeyboard);
      }
    }
    else if (command.startsWith('/addadmin ') && isAdmin) {
      const newAdminId = command.split(' ')[1];
      if (newAdminId && !isNaN(Number(newAdminId))) {
        if (!adminIds.includes(newAdminId)) {
          adminIds.push(newAdminId);
          await db.execute({
            sql: "INSERT INTO settings (key, value) VALUES ('telegramAdmins', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            args: [JSON.stringify(adminIds)]
          });
          await sendTelegramMessage(chatId, `✅ Администратор ${newAdminId} успешно добавлен.`, adminKeyboard);
          await sendTelegramMessage(newAdminId, `Вы были назначены администратором бота. Напишите /start, чтобы активировать меню.`, adminKeyboard);
        } else {
          await sendTelegramMessage(chatId, `⚠️ Этот ID уже является администратором.`, adminKeyboard);
        }
      } else {
        await sendTelegramMessage(chatId, `❌ Неверный формат ID. Нужны только цифры.`, adminKeyboard);
      }
    }
    else if (command.startsWith('/removeadmin ') && isAdmin) {
      const rmAdminId = command.split(' ')[1];
      if (rmAdminId === '6778470996') {
        return await sendTelegramMessage(chatId, `❌ Нельзя удалить главного создателя бота из админов!`, adminKeyboard);
      }
      if (adminIds.includes(rmAdminId)) {
        adminIds = adminIds.filter(id => id !== rmAdminId);
        await db.execute({
          sql: "INSERT INTO settings (key, value) VALUES ('telegramAdmins', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
          args: [JSON.stringify(adminIds)]
        });
        await sendTelegramMessage(chatId, `✅ Администратор ${rmAdminId} удален.`, adminKeyboard);
      } else {
        await sendTelegramMessage(chatId, `⚠️ Администратор не найден.`, adminKeyboard);
      }
    }
    
    // Send OK to Telegram only after all async work is done
    res.status(200).send('OK');
  } catch (err) {
    console.error('Telegram webhook error:', err);
    res.status(500).send('Error');
  }
});

// --- UPLOAD ROUTE (VERCEL BLOB) ---
app.post('/api/upload', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  try {
    // If BLOB_READ_WRITE_TOKEN is not set, we can't upload to Vercel Blob.
    // Let's provide a graceful fallback for local development if Vercel Blob isn't set up yet.
    if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.NODE_ENV !== 'production') {
      const fs = await import('fs/promises');
      const ext = path.extname(req.file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = req.file.fieldname + '-' + uniqueSuffix + ext;
      const uploadPath = path.resolve(process.cwd(), 'public/uploads', filename);
      await fs.writeFile(uploadPath, req.file.buffer);
      return res.json({ url: `/uploads/${filename}` });
    }

    // Upload to Vercel Blob
    const ext = path.extname(req.file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `uploads/${req.file.fieldname}-${uniqueSuffix}${ext}`;
    
    const blob = await put(filename, req.file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    res.json({ url: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file to cloud' });
  }
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err.message);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Only listen locally if we are running via node directly.
// In Vercel, it exports the app instead of listening.
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
  });
}

// Export for Vercel Serverless
export default app;
