import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Directory Setup ──────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const dbPath = path.join(__dirname, 'database.sqlite');

// ── Shared Schemas ──────────────────────────────────────────────────────────
const SCHEMA_SQLITE = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    age TEXT, phone TEXT, gender TEXT, skinUndertone TEXT, favoriteColor TEXT, theme TEXT DEFAULT 'light'
  );
  CREATE TABLE IF NOT EXISTS wardrobe_items (
    id TEXT PRIMARY KEY,
    userId INTEGER NOT NULL,
    image TEXT NOT NULL,
    gender TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT NOT NULL,
    colorName TEXT DEFAULT '',
    occasions TEXT DEFAULT '',
    accessoryType TEXT DEFAULT '',
    uploadedAt INTEGER NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS weekly_outfits (
    userId INTEGER NOT NULL,
    date TEXT NOT NULL,
    topItem TEXT,
    bottomItem TEXT,
    footwearItem TEXT,
    PRIMARY KEY(userId, date),
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    dressType TEXT DEFAULT '',
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  );
`;

const SCHEMA_PG = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    age TEXT, phone TEXT, gender TEXT, "skinUndertone" TEXT, "favoriteColor" TEXT, theme TEXT DEFAULT 'light'
  );
  CREATE TABLE IF NOT EXISTS wardrobe_items (
    id TEXT PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    image TEXT NOT NULL,
    gender TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT NOT NULL,
    "colorName" TEXT DEFAULT '',
    occasions TEXT DEFAULT '',
    "accessoryType" TEXT DEFAULT '',
    "uploadedAt" BIGINT NOT NULL,
    FOREIGN KEY("userId") REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS weekly_outfits (
    "userId" INTEGER NOT NULL,
    date TEXT NOT NULL,
    "topItem" TEXT,
    "bottomItem" TEXT,
    "footwearItem" TEXT,
    PRIMARY KEY("userId", date),
    FOREIGN KEY("userId") REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    "dressType" TEXT DEFAULT '',
    FOREIGN KEY("userId") REFERENCES users(id) ON DELETE CASCADE
  );
`;

// ── Helpers ──────────────────────────────────────────────────────────────────
function toPostgresParams(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

// ── Database Initialization ──────────────────────────────────────────────────
let pgPool = null;
let sqliteDb = null;

// 1. Initialize SQLite (Always On)
const sqlite3Module = await import('sqlite3');
const sqlite3 = sqlite3Module.default.verbose();

sqliteDb = await new Promise((resolve) => {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("SQLite Load Error:", err.message);
    db.exec(SCHEMA_SQLITE, () => {
      const runMigrations = () => {
        // Migrate existing tables: add new columns if missing
        const migrations = [
          `ALTER TABLE wardrobe_items ADD COLUMN colorName TEXT DEFAULT ''`,
          `ALTER TABLE wardrobe_items ADD COLUMN occasions TEXT DEFAULT ''`,
          `ALTER TABLE wardrobe_items ADD COLUMN accessoryType TEXT DEFAULT ''`,
          `ALTER TABLE events ADD COLUMN dressType TEXT DEFAULT ''`,
        ];
        let pending = migrations.length;
        if (pending === 0) {
           console.log('✔ Local SQLite ready.');
           resolve(db);
        } else {
           migrations.forEach(stmt => {
             db.run(stmt, () => { if (--pending === 0) { console.log('✔ Local SQLite ready.'); resolve(db); } });
           });
        }
      };

      db.all("PRAGMA table_info(weekly_outfits)", (err, rows) => {
        const hasDay = rows && rows.some(r => r.name === 'day');
        if (hasDay) {
          db.run('DROP TABLE weekly_outfits', () => {
            db.run(`
              CREATE TABLE IF NOT EXISTS weekly_outfits (
                userId INTEGER NOT NULL,
                date TEXT NOT NULL,
                topItem TEXT,
                bottomItem TEXT,
                footwearItem TEXT,
                PRIMARY KEY(userId, date),
                FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
              )
            `, runMigrations);
          });
        } else {
          runMigrations();
        }
      });
    });
  });
});

// 2. Initialize PostgreSQL (If Configured)
if (process.env.DATABASE_URL) {
  try {
    const { default: pg } = await import('pg');
    pgPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
    });
    
    // Test connection and init schema
    const client = await pgPool.connect();
    
    // Check if old weekly_outfits using 'day' exists, and drop it to allow recreation
    const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name='weekly_outfits' AND column_name='day'`);
    if (res.rows.length > 0) {
      await client.query(`DROP TABLE weekly_outfits`);
    }

    for (const stmt of SCHEMA_PG.split(';').map(s => s.trim()).filter(Boolean)) {
      await client.query(stmt);
    }
    client.release();
    console.log('✔ Cloud PostgreSQL ready.');
  } catch (err) {
    console.error('✘ PostgreSQL failed to connect. Using SQLite fallback.', err.message);
    pgPool = null; // Disable PG if connection fails
  }
}

// ── The Resilient Wrapper ────────────────────────────────────────────────────
export const db = {
  run(sql, params = [], callback) {
    const runInSqlite = () => {
      sqliteDb.run(sql, params, function(err) {
        if (callback) callback.call(this, err);
      });
    };

    if (pgPool) {
      const pgSql = toPostgresParams(sql);
      const returningSql = /^\s*INSERT/i.test(sql) ? pgSql + ' RETURNING id' : pgSql;
      
      pgPool.query(returningSql, params)
        .then(res => {
          const lastID = res.rows[0]?.id || null;
          if (callback) callback.call({ lastID }, null);
        })
        .catch(err => {
          console.error("PG Write Error, falling back to SQLite:", err.message);
          runInSqlite();
        });
    } else {
      runInSqlite();
    }
  },

  get(sql, params = [], callback) {
    if (pgPool) {
      pgPool.query(toPostgresParams(sql), params)
        .then(res => callback(null, res.rows[0]))
        .catch(() => sqliteDb.get(sql, params, callback));
    } else {
      sqliteDb.get(sql, params, callback);
    }
  },

  all(sql, params = [], callback) {
    if (pgPool) {
      pgPool.query(toPostgresParams(sql), params)
        .then(res => callback(null, res.rows))
        .catch(() => sqliteDb.all(sql, params, callback));
    } else {
      sqliteDb.all(sql, params, callback);
    }
  },

  // Shim for your wardrobe upload logic
  prepare(sql) {
    return {
      run: (params, callback) => this.run(sql, params, callback)
    };
  }
};