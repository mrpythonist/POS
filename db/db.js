import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { app } from "electron";
import btoa from "btoa";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get Electron's userData path (cross-platform)
const userDataDir = (app && app.getPath ? app.getPath("userData") : process.env.USER_DATA) || __dirname;

// Create a `db` folder inside userData
const dbDir = path.join(userDataDir, "db");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Full database path
const dbPath = path.join(dbDir, "pos.sqlite");

let db;
try {
  db = new Database(dbPath);
  console.log("✅ Database connected:", dbPath);
} catch (err) {
  console.error("❌ Failed to connect to database:", err);
  process.exit(1);
}

// --------- SETTINGS TABLE --------- //
db.prepare(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    app TEXT,
    store TEXT,
    address_one TEXT,
    address_two TEXT,
    contact TEXT,
    tax REAL,
    symbol TEXT,
    percentage REAL,
    charge_tax INTEGER,
    footer TEXT,
    img TEXT
  )
`).run();

// --------- USERS TABLE --------- //
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    fullname TEXT,
    perm_products INTEGER,
    perm_categories INTEGER,
    perm_transactions INTEGER,
    perm_users INTEGER,
    perm_settings INTEGER,
    status TEXT
  )
`).run();

// --------- CATEGORIES TABLE --------- //
db.prepare(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`).run();

// --------- CUSTOMERS TABLE --------- //
db.prepare(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT
  )
`).run();

// --------- INVENTORY TABLE --------- //
  db.prepare(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      category TEXT,
      quantity INTEGER DEFAULT 0,
      stock INTEGER DEFAULT 1,
      img TEXT
    )
  `).run();

// --------- TRANSACTIONS TABLE --------- //
db.prepare(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_number TEXT,
    status INTEGER,
    customer TEXT,
    date TEXT,
    user_id INTEGER,
    till INTEGER,
    total REAL,
    paid REAL,
    items TEXT
  )
`).run();


console.log("✅ Created all tables");

// Insert default settings if empty
const settingsCount = db.prepare("SELECT COUNT(*) AS cnt FROM settings").get().cnt;
if (settingsCount === 0) {
  db.prepare(`
    INSERT INTO settings (
      id, app, store, address_one, address_two, contact,
      tax, symbol, percentage, charge_tax, footer, img
    ) VALUES (
      1, 'POS', 'FLAVORS',
      'Near Malik Solar Energy, Lodhran Road',
      'Rajaram Zarif Shaheed, Shujabad, Multan', '0310-4004515',
      0, 'Rs. ', 0, 0, 'Thank you for visiting US!', 'assets/images/logo.png'
    )
  `).run();

  console.log("✅ Default settings inserted");
}

// Insert default settings if empty
const usersCount = db.prepare("SELECT COUNT(*) AS cnt FROM users").get().cnt;
if (usersCount === 0) {
  const User = {
      id: 1,
      username: "admin",
      password: btoa("admin"),
      fullname: "Administrator",
      perm_products: 1,
      perm_categories: 1,
      perm_transactions: 1,
      perm_users: 1,
      perm_settings: 1,
      status: ""
    };
    db.prepare(`
      INSERT INTO users (id, username, password, fullname, perm_products, perm_categories, perm_transactions, perm_users, perm_settings, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      User.id,
      User.username,
      User.password,
      User.fullname,
      User.perm_products,
      User.perm_categories,
      User.perm_transactions,
      User.perm_users,
      User.perm_settings,
      User.status
    );

  console.log("✅ Default user inserted");
}

export default db;
