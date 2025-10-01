// api/settings.js
import express from "express";
import bodyParser from "body-parser";
import db from "../db/db.js"; // <-- better-sqlite3 connection

const app = express();
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
  res.send("Settings API (better-sqlite3, no uploads)");
});

// Fetch settings (always ID = 1)
app.get("/get", (req, res) => {
  try {
    let row = db.prepare(`SELECT * FROM settings WHERE id = 1`).get();

    if (!row) {
      row = {};
    }

    // Always return default logo if none
    row.img = "assets/images/logo.png";

    res.json(row);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Insert or update settings
app.post("/post", (req, res) => {
  const now = new Date().toISOString();

  const settingsData = {
    id: 1,
    app: req.body.app,
    store: req.body.store,
    address_one: req.body.address_one,
    address_two: req.body.address_two,
    contact: req.body.contact,
    tax: req.body.tax,
    symbol: req.body.symbol,
    percentage: req.body.percentage,
    charge_tax: req.body.charge_tax,
    footer: req.body.footer,
    img: "assets/images/logo.png", // always fallback
    updated_at: now
  };

  try {
    db.prepare(`
      INSERT INTO settings (id, app, store, address_one, address_two, contact, tax, symbol, percentage, charge_tax, footer, img, updated_at)
      VALUES (@id, @app, @store, @address_one, @address_two, @contact, @tax, @symbol, @percentage, @charge_tax, @footer, @img, @updated_at)
      ON CONFLICT(id) DO UPDATE SET
        app = excluded.app,
        store = excluded.store,
        address_one = excluded.address_one,
        address_two = excluded.address_two,
        contact = excluded.contact,
        tax = excluded.tax,
        symbol = excluded.symbol,
        percentage = excluded.percentage,
        charge_tax = excluded.charge_tax,
        footer = excluded.footer,
        img = excluded.img,
        updated_at = excluded.updated_at
    `).run(settingsData);

    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default app;
