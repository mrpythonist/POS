import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { app } from "electron";

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

// SETTINGS TABLE
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
    img TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// CATEGORIES
db.prepare(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER DEFAULT NULL,
    img TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
  )
`).run();

// CUSTOMERS
db.prepare(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    address TEXT,
    loyalty_points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// INVENTORY (Products / Menu Items)
db.prepare(`
  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER,
    price REAL NOT NULL,
    description TEXT,
    img TEXT,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  )
`).run();

// VARIATIONS (e.g. Small, Medium, Large Pizza)
db.prepare(`
  CREATE TABLE IF NOT EXISTS variations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inventory_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
  )
`).run();

// TRANSACTIONS (Orders)
db.prepare(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE,
    ref_number TEXT,
    customer_id INTEGER,
    subtotal REAL,
    discount REAL DEFAULT 0,
    discount_code TEXT,
    tax REAL,
    total REAL,
    paid REAL,
    change REAL,
    order_type INTEGER,         -- 0=Takeaway, 1=Dine-in, 2=Delivery
    status INTEGER,             -- 0=Pending, 1=Completed, 2=Canceled
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    till INTEGER,
    mac TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

// TRANSACTION ITEMS
db.prepare(`
  CREATE TABLE IF NOT EXISTS transaction_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    inventory_id INTEGER NOT NULL,
    variation_id INTEGER,
    quantity INTEGER DEFAULT 1,
    price REAL,
    discount REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id),
    FOREIGN KEY (variation_id) REFERENCES variations(id)
  )
`).run();

// PAYMENTS
db.prepare(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    payment_type INTEGER,   -- 0=Cash, 1=Card, 2=Online
    payment_info TEXT,
    amount REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
  )
`).run();

// DISCOUNTS
db.prepare(`
  CREATE TABLE IF NOT EXISTS discounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    type INTEGER,   -- 0=percentage, 1=fixed
    value REAL,
    start_date DATETIME,
    end_date DATETIME,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// USERS
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    fullname TEXT,
    role TEXT,   -- admin, cashier, manager
    status INTEGER DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// AUDIT LOGS
db.prepare(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    table_name TEXT,
    record_id INTEGER,
    old_value TEXT,
    new_value TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

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
      'Rajaram Zarif Shaheed, Shujabad, Multan.', '0310-4004515',
      0, 'Rs. ', 0, 0, 'Thank you for visiting US!', 'assets/images/logo.png'
    )
  `).run();

  console.log("✅ Default settings inserted");
}

export default db;
