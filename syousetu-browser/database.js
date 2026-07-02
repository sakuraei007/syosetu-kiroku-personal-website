// database.js
const { createClient } = require('@libsql/client');
require('dotenv').config();

const database = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN,
});

async function initDatabase() {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS novels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      tags TEXT NOT NULL,
      summary TEXT,
      rating INTEGER DEFAULT 0,
      status TEXT DEFAULT '完結済',
      user_id INTEGER
    )
  `);
}

initDatabase().catch(console.error);

module.exports = database;