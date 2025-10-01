// api/discounts.js
import express from "express";
import bodyParser from "body-parser";
import db from "../db/db.js";

const app = express();
app.use(bodyParser.json());

// Get all discounts
app.get("/all", (req, res) => {
  const rows = db.prepare("SELECT * FROM discounts").all();
  res.send(rows);
});

// Get discount by code
app.get("/code/:code", (req, res) => {
  const row = db.prepare("SELECT * FROM discounts WHERE code = ?").get(req.params.code);
  res.send(row || {});
});

// Add / Update discount
app.post("/discount", (req, res) => {
  const d = req.body;
  if (!d.id) {
    db.prepare(`
      INSERT INTO discounts (code, type, value, start_date, end_date, usage_limit) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(d.code, d.type, d.value, d.start_date, d.end_date, d.usage_limit);
    res.sendStatus(201);
  } else {
    db.prepare(`
      UPDATE discounts 
      SET code=?, type=?, value=?, start_date=?, end_date=?, usage_limit=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(d.code, d.type, d.value, d.start_date, d.end_date, d.usage_limit, d.id);
    res.sendStatus(200);
  }
});

// Delete discount
app.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM discounts WHERE id=?").run(req.params.id);
  res.sendStatus(200);
});

export default app;
