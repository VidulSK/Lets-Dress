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
const PORT = 3000;

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true })); // Default Vite port is 5173
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
    [username, password, email, age, phone, gender, skinUndertone, favoriteColor],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      const userId = this.lastID;
      res.cookie('userId', userId, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.status(201).json({ id: userId, username, email });
    }
  );
});

app.post('/api/auth/signin', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });
    
    res.cookie('userId', row.id, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ id: row.id, username: row.username, email: row.email, gender: row.gender });
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('userId');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  db.get(`SELECT id, username, email, age, phone, gender, skinUndertone, favoriteColor, theme FROM users WHERE id = ?`, [req.userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
});

app.put('/api/auth/theme', requireAuth, (req, res) => {
  const { theme } = req.body;
  db.run(`UPDATE users SET theme = ? WHERE id = ?`, [theme, req.userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, theme });
  });
});

// --- WARDROBE ROUTES ---
app.get('/api/wardrobe', requireAuth, (req, res) => {
  db.all(`SELECT * FROM wardrobe_items WHERE userId = ? ORDER BY uploadedAt DESC`, [req.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/wardrobe', requireAuth, upload.single('image'), (req, res) => {
  const { id, gender, type, color, uploadedAt } = req.body;
  const imagePath = req.file ? '/uploads/' + req.file.filename : req.body.image;

  // req.body.image is used if the image is passed as a data URL, but typically we want it to be a file.
  // We will support both data URL strings and file uploads.
  // If no file but there's a data URL string:
  let finalImagePath = imagePath;
  if (!req.file && imagePath && imagePath.startsWith('data:image')) {
    // Generate a file from base64 string
    const matches = imagePath.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg';
      const filepath = path.join(__dirname, 'uploads', filename);
      fs.writeFileSync(filepath, buffer);
      finalImagePath = '/uploads/' + filename;
    }
  }

  const stmt = db.prepare(`INSERT INTO wardrobe_items (id, userId, image, gender, type, color, uploadedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  stmt.run([id, req.userId, finalImagePath, gender, type, color, uploadedAt], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ 
      id, userId: req.userId, image: finalImagePath, gender, type, color, uploadedAt 
    });
  });
});

app.delete('/api/wardrobe/:id', requireAuth, (req, res) => {
  db.get(`SELECT image FROM wardrobe_items WHERE id = ? AND userId = ?`, [req.params.id, req.userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Item not found' });
    
    // Delete file if it exists
    if (row.image && row.image.startsWith('/uploads/')) {
      const filepath = path.join(__dirname, '..', row.image);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    db.run(`DELETE FROM wardrobe_items WHERE id = ? AND userId = ?`, [req.params.id, req.userId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

// --- WEEKLY OUTFITS (RANDOMIZER) ROUTES ---
app.get('/api/outfits', requireAuth, (req, res) => {
  db.all(`SELECT * FROM weekly_outfits WHERE userId = ?`, [req.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // we need to return the full item objects.
    // Let's do a join or simple subqueries. For simplicity we'll just return the full items if available.
    // Instead of complex JOINS, let's just fetch all wardrobe items for the user, and map them.
    db.all(`SELECT * FROM wardrobe_items WHERE userId = ?`, [req.userId], (err, items) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const itemsMap = items.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});

      const formattedOutfits = rows.map(r => ({
        day: r.day,
        outfit: {
          top: itemsMap[r.topItem] || null,
          bottom: itemsMap[r.bottomItem] || null,
          footwear: itemsMap[r.footwearItem] || null
        }
      }));
      res.json(formattedOutfits);
    });
  });
});

app.post('/api/outfits', requireAuth, (req, res) => {
  const { day, outfit } = req.body;
  if (!day) return res.status(400).json({ error: 'Day is required' });

  // Clear outfit for day if outfit is null
  if (!outfit) {
    db.run(`DELETE FROM weekly_outfits WHERE userId = ? AND day = ?`, [req.userId, day], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.json({ success: true });
    });
    return;
  }

  const topItem = outfit.top?.id || null;
  const bottomItem = outfit.bottom?.id || null;
  const footwearItem = outfit.footwear?.id || null;

  db.run(
    `INSERT INTO weekly_outfits (userId, day, topItem, bottomItem, footwearItem) 
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(userId, day) 
     DO UPDATE SET topItem=excluded.topItem, bottomItem=excluded.bottomItem, footwearItem=excluded.footwearItem`,
    [req.userId, day, topItem, bottomItem, footwearItem],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// --- EVENTS ROUTES ---
app.get('/api/events', requireAuth, (req, res) => {
  db.all(`SELECT date, title FROM events WHERE userId = ?`, [req.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/events', requireAuth, (req, res) => {
  const { date, title } = req.body;
  db.run(`INSERT INTO events (userId, date, title) VALUES (?, ?, ?)`, [req.userId, date, title], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, date, title });
  });
});

app.delete('/api/events', requireAuth, (req, res) => {
  const { date, title } = req.body;
  db.run(`DELETE FROM events WHERE userId = ? AND date = ? AND title = ?`, [req.userId, date, title], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
