// db.js - SQLite Database (Cloud-Ready)
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create academic_info table
    db.run(`CREATE TABLE IF NOT EXISTS academic_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      semester INTEGER NOT NULL,
      sgpa REAL,
      attendance INTEGER DEFAULT 0,
      usn TEXT,
      name TEXT,
      department TEXT,
      sub1 TEXT, sub2 TEXT, sub3 TEXT, sub4 TEXT, sub5 TEXT,
      sub6 TEXT, sub7 TEXT, sub8 TEXT, sub9 TEXT,
      cgpa REAL, total_classes INTEGER, attended_classes INTEGER, remarks TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Create extracurricular tables
    db.run(`CREATE TABLE IF NOT EXISTS hackathons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      role TEXT,
      technologies TEXT,
      project TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT,
      type TEXT,
      award TEXT,
      date TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS awards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT,
      organization TEXT,
      date TEXT,
      description TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT,
      organization TEXT,
      date TEXT,
      description TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Create personal_info table
    db.run(`CREATE TABLE IF NOT EXISTS personal_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      full_name TEXT,
      dob TEXT,
      gender TEXT,
      phone TEXT,
      alt_phone TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      blood_group TEXT,
      father_name TEXT,
      father_phone TEXT,
      father_alt_phone TEXT,
      mother_name TEXT,
      mother_phone TEXT,
      mother_alt_phone TEXT,
      nationality TEXT,
      aadhar TEXT,
      guardian_name TEXT,
      guardian_relation TEXT,
      guardian_phone TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Create goals table
    db.run(`CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      goal_sgpa REAL,
      goal_attendance REAL,
      goal_study_hours INTEGER,
      goal_books INTEGER,
      goal_hackathons INTEGER,
      goal_certificates INTEGER,
      goal_note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    console.log('Database tables initialized successfully');
  });
}

// Export with promise-like interface
module.exports = {
  db,
  query: (sql, params) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params || [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  run: (sql, params) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params || [], function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  get: (sql, params) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params || [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};
