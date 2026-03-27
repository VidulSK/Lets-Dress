import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
// @gradio/client is no longer needed - using GoogleAuth
import { GoogleAuth } from 'google-auth-library';
import { db } from './db.js';

// HF_TOKEN is no longer needed since we are running IDM-VTON locally on port 7860!

// ── Manual .env loader (fallback for when --env-file flag isn't available) ──
try {
  const envPath = new URL('../.env', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch { /* .env not found — rely on system env vars */ }

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
app.use('/avatars', express.static(path.join(__dirname, '../public/avatars')));

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

// --- AVATAR ROUTE ---
// Returns the path of the correct base avatar PNG based on gender + skinUndertone
app.get('/api/avatar', requireAuth, (req, res) => {
  db.get(`SELECT gender, skinUndertone FROM users WHERE id = ?`, [req.userId], (err, row) => {
    if (err || !row) return res.status(500).json({ error: 'User not found' });
    const gender = (row.gender || 'male').toLowerCase();
    const undertone = (row.skinUndertone || 'neutral').toLowerCase();
    // Map undertone to one of: warm | cool | neutral
    let tone = 'neutral';
    if (undertone.includes('warm')) tone = 'warm';
    else if (undertone.includes('cool')) tone = 'cool';
    const avatarPath = `/avatars/${gender}-${tone}.png`;
    res.json({ avatarPath });
  });
});

// --- VIRTUAL TRY-ON PROXY ROUTE ---
// Two-step try-on: Step 1 = avatar + top, Step 2 = result of step 1 + bottom
// Body: { garmentImageUrl: string, bottomImageUrl?: string }
app.post('/api/tryon', requireAuth, async (req, res) => {
  const { garmentImageUrl, bottomImageUrl } = req.body;
  if (!garmentImageUrl) return res.status(400).json({ error: 'garmentImageUrl is required' });

  // Helper: load image from a server-relative path or absolute URL -> Buffer
  async function loadImageBuffer(url) {
    if (url.startsWith('/uploads/')) return fs.readFileSync(path.join(__dirname, url));
    const r = await fetch(url);
    return Buffer.from(await r.arrayBuffer());
  }

  async function callTryOnSpace(personBlob, garmentBlob) {
    // ── Google Vertex AI Serverless Engine ──
    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION || 'us-central1';
    
    if (!projectId) {
      throw new Error("GCP_PROJECT_ID is missing from .env File");
    }

    try {
      let authOptions = {
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      };

      // In production/deployment, reading from a local C:\ file path fails.
      // We check for direct JSON injection via environment variables first.
      if (process.env.GCP_CREDENTIALS_BASE64) {
        try {
          const jsonStr = Buffer.from(process.env.GCP_CREDENTIALS_BASE64, 'base64').toString('utf8');
          authOptions.credentials = JSON.parse(jsonStr);
        } catch (e) {
          throw new Error("Failed to parse GCP_CREDENTIALS_BASE64. Ensure it is valid base64 encoded JSON.");
        }
      } else if (process.env.GCP_SERVICE_ACCOUNT_JSON) {
        try {
          authOptions.credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON);
        } catch (e) {
          throw new Error("Failed to parse GCP_SERVICE_ACCOUNT_JSON. Ensure it is valid JSON without broken formatting.");
        }
      }
      // If neither is provided, google-auth-library automatically falls back to 
      // reading the file path specified in GOOGLE_APPLICATION_CREDENTIALS.

      const auth = new GoogleAuth(authOptions);
      const client = await auth.getClient();
      const token = await client.getAccessToken();

      const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/virtual-try-on-001:predict`;

      // Convert Blobs to Base64 (Node JS Blobs -> ArrayBuffer -> Buffer -> Base64)
      const personArr = await personBlob.arrayBuffer();
      const garmentArr = await garmentBlob.arrayBuffer();

      // Official schema from cloud.google.com/vertex-ai/generative-ai/docs/model-reference/virtual-try-on-api
      const payload = {
        instances: [
          {
            personImage: {
              image: { bytesBase64Encoded: Buffer.from(personArr).toString('base64') }
            },
            productImages: [
              {
                image: { bytesBase64Encoded: Buffer.from(garmentArr).toString('base64') }
              }
            ]
          }
        ],
        parameters: { sampleCount: 1 }
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(`Vertex AI Error: ${JSON.stringify(data.error || data)}`);
      }

      // Vertex AI typically returns predictions array containing bytesBase64Encoded 
      if (data.predictions && data.predictions.length > 0) {
        const outBase64 = data.predictions[0].bytesBase64Encoded;
        if (outBase64) {
          return Buffer.from(outBase64, 'base64');
        }
      }

      throw new Error('No bytesBase64Encoded returned in prediction response');
    } catch (err) {
      console.error(`[VertexAI] Connection failed:`, err?.message || err);
      throw new Error(`Vertex AI prediction failed. Ensure GOOGLE_APPLICATION_CREDENTIALS and GCP_PROJECT_ID are correct. ${err?.message || ''}`);
    }
  }

  try {
    // Resolve avatar for this user
    const user = await new Promise((resolve, reject) => {
      db.get(`SELECT gender, skinUndertone FROM users WHERE id = ?`, [req.userId], (err, row) => {
        if (err || !row) reject(new Error('User not found'));
        else resolve(row);
      });
    });

    const gender = (user.gender || 'male').toLowerCase();
    const undertone = (user.skinUndertone || 'neutral').toLowerCase();
    let tone = 'neutral';
    if (undertone.includes('warm')) tone = 'warm';
    else if (undertone.includes('cool')) tone = 'cool';

    // Load base avatar
    const avatarBuffer = fs.readFileSync(path.join(__dirname, '../public/avatars', `${gender}-${tone}.png`));

    // STEP 1: Dress the TOP onto the base avatar
    const topBuffer = await loadImageBuffer(garmentImageUrl);
    const step1Buffer = await callTryOnSpace(
      new Blob([avatarBuffer], { type: 'image/png' }),
      new Blob([topBuffer], { type: 'image/jpeg' })
    );
    if (!step1Buffer) {
      return res.status(503).json({ error: 'Virtual try-on service is currently unavailable. Please try again later.' });
    }

    // STEP 2 (optional): Dress the BOTTOM onto the top-dressed avatar
    let finalBuffer = step1Buffer;
    if (bottomImageUrl) {
      const bottomBuffer = await loadImageBuffer(bottomImageUrl);
      const step2Buffer = await callTryOnSpace(
        new Blob([step1Buffer], { type: 'image/png' }),
        new Blob([bottomBuffer], { type: 'image/jpeg' })
      );
      if (step2Buffer) finalBuffer = step2Buffer;
      // If step 2 fails, we still return the top-only result (graceful degradation)
    }

    // Return final image as base64 data URL
    const b64 = finalBuffer.toString('base64');
    res.json({ imageDataUrl: `data:image/png;base64,${b64}` });

  } catch (err) {
    console.error('Try-on error:', err);
    res.status(500).json({ error: 'Try-on failed: ' + (err?.message || 'Unknown error') });
  }
});



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
