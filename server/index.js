import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';
const isDev = !isProd;

// Middleware
app.use(cors({
  origin: isDev ? ['http://localhost:5173', 'http://localhost:5174'] : true,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Cookie options helper
const cookieOpts = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
});

// --- AUTH MIDDLEWARE ---
const requireAuth = (req, res, next) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = userId;
  next();
};

// --- AUTH ROUTES ---
app.post('/api/auth/signup', (req, res) => {
  const { username, password, email, age, phone, gender, skinUndertone, favoriteColor } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO users (username, password, email, age, phone, gender, skinUndertone, favoriteColor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [username, password, email, age || null, phone || null, gender || null, skinUndertone || null, favoriteColor || null],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed') || err.message.includes('unique constraint')) {
          return res.status(409).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      const userId = this.lastID;
      res.cookie('userId', userId, cookieOpts());
      res.status(201).json({ id: userId, username, email });
    }
  );
});

app.post('/api/auth/signin', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });

    res.cookie('userId', row.id, cookieOpts());
    res.json({ id: row.id, username: row.username, email: row.email, gender: row.gender });
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('userId', cookieOpts());
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  db.get(
    `SELECT id, username, email, age, phone, gender, skinUndertone, favoriteColor, theme FROM users WHERE id = ?`,
    [req.userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'User not found' });
      res.json(row);
    }
  );
});

app.put('/api/auth/theme', requireAuth, (req, res) => {
  const { theme } = req.body;
  db.run(`UPDATE users SET theme = ? WHERE id = ?`, [theme, req.userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, theme });
  });
});

// --- WARDROBE ROUTES ---
app.get('/api/wardrobe', requireAuth, (req, res) => {
  db.all(`SELECT * FROM wardrobe_items WHERE userId = ? ORDER BY uploadedAt DESC`, [req.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Normalize column names for PG (quoted) vs SQLite
    const normalized = (rows || []).map(r => ({
      ...r,
      colorName: r.colorName || r['colorName'] || '',
      accessoryType: r.accessoryType || r['accessoryType'] || '',
      occasions: r.occasions || '',
    }));
    res.json(normalized);
  });
});

app.post('/api/wardrobe', requireAuth, upload.single('image'), (req, res) => {
  const { id, gender, type, color, colorName, occasions, accessoryType, uploadedAt } = req.body;
  const imagePath = req.file ? '/uploads/' + req.file.filename : req.body.image;

  let finalImagePath = imagePath;
  if (!req.file && imagePath && imagePath.startsWith('data:image')) {
    const matches = imagePath.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg';
      const filepath = path.join(__dirname, 'uploads', filename);
      fs.writeFileSync(filepath, buffer);
      finalImagePath = '/uploads/' + filename;
    }
  }

  // Use db.run directly instead of prepare() for cross-DB compatibility
  db.run(
    `INSERT INTO wardrobe_items (id, userId, image, gender, type, color, colorName, occasions, accessoryType, uploadedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, req.userId, finalImagePath, gender, type, color, colorName || '', occasions || '', accessoryType || '', uploadedAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        id, userId: req.userId, image: finalImagePath, gender, type, color, colorName: colorName || '', occasions: occasions || '', accessoryType: accessoryType || '', uploadedAt
      });
    }
  );
});

app.delete('/api/wardrobe/:id', requireAuth, (req, res) => {
  db.get(`SELECT image FROM wardrobe_items WHERE id = ? AND userId = ?`, [req.params.id, req.userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Item not found' });

    // Delete file if stored locally
    if (row.image && row.image.startsWith('/uploads/')) {
      const filepath = path.join(__dirname, row.image);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }

    db.run(`DELETE FROM wardrobe_items WHERE id = ? AND userId = ?`, [req.params.id, req.userId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

// --- WEEKLY OUTFITS (RANDOMIZER) ROUTES ---
app.get('/api/outfits', requireAuth, (req, res) => {
  db.all(`SELECT * FROM weekly_outfits WHERE userId = ?`, [req.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all(`SELECT * FROM wardrobe_items WHERE userId = ?`, [req.userId], (err, items) => {
      if (err) return res.status(500).json({ error: err.message });

      const itemsMap = items.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});

      const formattedOutfits = rows.map(r => ({
        date: r.date,
        outfit: {
          top: itemsMap[r.topItem || r['topItem']] || null,
          bottom: itemsMap[r.bottomItem || r['bottomItem']] || null,
          footwear: itemsMap[r.footwearItem || r['footwearItem']] || null
        }
      }));
      res.json(formattedOutfits);
    });
  });
});

app.post('/api/outfits', requireAuth, (req, res) => {
  const { date, outfit } = req.body;
  if (!date) return res.status(400).json({ error: 'Date is required' });

  if (!outfit) {
    db.run(`DELETE FROM weekly_outfits WHERE userId = ? AND date = ?`, [req.userId, date], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.json({ success: true });
    });
    return;
  }

  const topItem = outfit.top?.id || null;
  const bottomItem = outfit.bottom?.id || null;
  const footwearItem = outfit.footwear?.id || null;

  db.run(
    `INSERT INTO weekly_outfits (userId, date, topItem, bottomItem, footwearItem)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(userId, date)
     DO UPDATE SET topItem=excluded.topItem, bottomItem=excluded.bottomItem, footwearItem=excluded.footwearItem`,
    [req.userId, date, topItem, bottomItem, footwearItem],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// --- EVENTS ROUTES ---
app.get('/api/events', requireAuth, (req, res) => {
  db.all(`SELECT date, title, dressType FROM events WHERE userId = ?`, [req.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const normalized = (rows || []).map(r => ({ ...r, dressType: r.dressType || r['dressType'] || '' }));
    res.json(normalized);
  });
});

app.post('/api/events', requireAuth, (req, res) => {
  const { date, title, dressType } = req.body;
  db.run(`INSERT INTO events (userId, date, title, dressType) VALUES (?, ?, ?, ?)`, [req.userId, date, title, dressType || ''], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, date, title, dressType: dressType || '' });
  });
});

app.delete('/api/events', requireAuth, (req, res) => {
  const { date, title } = req.body;
  db.run(`DELETE FROM events WHERE userId = ? AND date = ? AND title = ?`, [req.userId, date, title], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// In production, serve the Vite build and handle SPA routing
if (isProd) {
  const distPath = path.join(__dirname, '../dist'); // Ensure this is defined
  app.use(express.static(distPath)); // This serves your CSS/JS files

  // The "Catch-all" route
  app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${isProd ? 'production' : 'development'}] [${process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite'}]`);
});
