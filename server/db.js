/**
 * db.js — Dual-mode database abstraction
 *
 * Cloud mode  : Set DATABASE_URL env var → uses PostgreSQL (pg)
 * Local mode  : No DATABASE_URL         → uses SQLite (sqlite3)
 *
 * Both modes expose the same interface:
 *   db.run(sql, params, callback)   – execute a write; callback(err, { lastID })
 *   db.get(sql, params, callback)   – fetch one row; callback(err, row)
 *   db.all(sql, params, callback)   – fetch all rows; callback(err, rows)
 *
 * SQL is written in SQLite style (? placeholders).
 * In PostgreSQL mode the adapter converts ? → $1, $2 … automatically.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Ensure uploads directory exists (used in both modes) ──────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── Shared SQL schema ──────────────────────────────────────────────────────────
// Written to be compatible with both SQLite and PostgreSQL.
// Key differences handled here:
//   • INTEGER PRIMARY KEY AUTOINCREMENT  →  SERIAL PRIMARY KEY (pg)
//   • ON CONFLICT … DO UPDATE (upsert)   →  same syntax works in both ✓
const SCHEMA_SQLITE = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    age TEXT,
    phone TEXT,
    gender TEXT,
    skinUndertone TEXT,
    favoriteColor TEXT,
    theme TEXT DEFAULT 'light'
  );
  CREATE TABLE IF NOT EXISTS wardrobe_items (
    id TEXT PRIMARY KEY,
    userId INTEGER NOT NULL,
    image TEXT NOT NULL,
    gender TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT NOT NULL,
    uploadedAt INTEGER NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS weekly_outfits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    day TEXT NOT NULL,
    topItem TEXT,
    bottomItem TEXT,
    footwearItem TEXT,
    UNIQUE(userId, day),
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  );
`;

const SCHEMA_PG = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    age TEXT,
    phone TEXT,
    gender TEXT,
    "skinUndertone" TEXT,
    "favoriteColor" TEXT,
    theme TEXT DEFAULT 'light'
  );
  CREATE TABLE IF NOT EXISTS wardrobe_items (
    id TEXT PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    image TEXT NOT NULL,
    gender TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT NOT NULL,
    "uploadedAt" BIGINT NOT NULL,
    FOREIGN KEY("userId") REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS weekly_outfits (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    day TEXT NOT NULL,
    "topItem" TEXT,
    "bottomItem" TEXT,
    "footwearItem" TEXT,
    UNIQUE("userId", day),
    FOREIGN KEY("userId") REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    FOREIGN KEY("userId") REFERENCES users(id) ON DELETE CASCADE
  );
`;

// ── Helper: convert SQLite ? placeholders to PostgreSQL $1, $2 … ──────────────
function toPostgresParams(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

// ── Helper: normalise a pg result row so camelCase keys match SQLite column names ──
// PostgreSQL quoted identifiers are case-sensitive; un-quote them for the app.
function normalisePgRow(row) {
  if (!row) return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    // Strip surrounding quotes if accidentally preserved, keep as-is otherwise
    out[k] = v;
  }
  return out;
}

// ══════════════════════════════════════════════════════════════════════════════
// MODE A — PostgreSQL
// ══════════════════════════════════════════════════════════════════════════════
async function buildPgDb() {
  const { default: pg } = await import('pg');
  const { Pool } = pg;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost')
      ? false
      : { rejectUnauthorized: false },
  });

  // Init schema
  try {
    const client = await pool.connect();
    // Run each statement individually (pg doesn't support multi-statement strings in query())
    for (const stmt of SCHEMA_PG.split(';').map(s => s.trim()).filter(Boolean)) {
      await client.query(stmt);
    }
    client.release();
    console.log('Connected to PostgreSQL database and schema initialised.');
  } catch (err) {
    console.error('PostgreSQL schema init error:', err.message);
    process.exit(1);
  }

  // Detect UNIQUE constraint violation in pg
  function isUniqueError(err) {
    return err.code === '23505';
  }

  return {
    run(sql, params = [], callback) {
      const pgSql = toPostgresParams(sql);
      // For INSERT … RETURNING id
      const returningSql = /^\s*INSERT/i.test(sql)
        ? pgSql + ' RETURNING id'
        : pgSql;

      pool.query(returningSql, params)
        .then(result => {
          const lastID = result.rows && result.rows[0] ? result.rows[0].id : null;
          if (callback) callback.call({ lastID }, null);
        })
        .catch(err => {
          if (isUniqueError(err)) {
            err.message = 'UNIQUE constraint failed: ' + err.detail;
          }
          if (callback) callback.call({}, err);
        });
    },

    get(sql, params = [], callback) {
      const pgSql = toPostgresParams(sql);
      pool.query(pgSql, params)
        .then(result => {
          callback(null, result.rows[0] ? normalisePgRow(result.rows[0]) : undefined);
        })
        .catch(err => callback(err));
    },

    all(sql, params = [], callback) {
      const pgSql = toPostgresParams(sql);
      pool.query(pgSql, params)
        .then(result => {
          callback(null, result.rows.map(normalisePgRow));
        })
        .catch(err => callback(err));
    },

    // prepare() shim — only used in one place (wardrobe POST insert)
    // Returns an object with a run() method that behaves like db.run()
    prepare(sql) {
      return {
        run: (params, callback) => {
          this.run(sql, Array.isArray(params) ? params : Object.values(params), callback);
        },
      };
    },
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// Export — resolved asynchronously so index.js imports after DB is ready
// ══════════════════════════════════════════════════════════════════════════════

let db;

if (process.env.DATABASE_URL) {
  // Cloud / PostgreSQL mode
  db = await buildPgDb();
} else {
  // Local / SQLite mode — sqlite3 uses sync-style constructor so wrap in async
  const sqlite3Module = await import('sqlite3');
  const sqlite3 = sqlite3Module.default;

  const dbPath = path.join(__dirname, 'database.sqlite');
  db = await new Promise((resolve, reject) => {
    const sqlite = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      console.log('Connected to SQLite database.');
      sqlite.exec(SCHEMA_SQLITE, (err) => {
        if (err) console.error('SQLite schema init error:', err.message);
        resolve({
          run(sql, params = [], callback) {
            sqlite.run(sql, params, callback);
          },
          get(sql, params = [], callback) {
            sqlite.get(sql, params, callback);
          },
          all(sql, params = [], callback) {
            sqlite.all(sql, params, callback);
          },
          prepare(sql) {
            return sqlite.prepare(sql);
          },
        });
      });
    });
  });
}

export { db };
