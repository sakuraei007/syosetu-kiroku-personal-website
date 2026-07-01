// database.js
const Database = require('better-sqlite3');

const database = new Database('novels.db');

// user database table
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`);

// novel database table 
database.exec(`
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




module.exports = database;