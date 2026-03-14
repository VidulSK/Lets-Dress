import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
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
    )`);

    // Wardrobe items table
    db.run(`CREATE TABLE IF NOT EXISTS wardrobe_items (
      id TEXT PRIMARY KEY,
      userId INTEGER NOT NULL,
      image TEXT NOT NULL,
      gender TEXT NOT NULL,
      type TEXT NOT NULL,
      color TEXT NOT NULL,
      uploadedAt INTEGER NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Weekly outfits table
    db.run(`CREATE TABLE IF NOT EXISTS weekly_outfits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      day TEXT NOT NULL,
      topItem TEXT,
      bottomItem TEXT,
      footwearItem TEXT,
      UNIQUE(userId, day),
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Events table
    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`);
  });
}

export { db };
