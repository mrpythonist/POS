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

export default db;
