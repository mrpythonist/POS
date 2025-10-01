// api/variations.js
import express from "express";
import bodyParser from "body-parser";
import db from "../db/db.js";

const app = express();
app.use(bodyParser.json());

// Get all variations
app.get("/all", (req, res) => {
  const rows = db.prepare("SELECT * FROM variations").all();
  res.send(rows);
});

// Get variation by ID
app.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM variations WHERE id = ?").get(req.params.id);
  res.send(row || {});
});

// Get variations by inventory_id
app.get("/inventory/:inventoryId", (req, res) => {
  const rows = db.prepare("SELECT * FROM variations WHERE inventory_id = ?").all(req.params.inventoryId);
  res.send(rows);
});

// Add / Update variation
app.post("/post", (req, res) => {
  const v = req.body;
  if (!v.id) {
    db.prepare(`
      INSERT INTO variations (inventory_id, name, price, is_default) 
      VALUES (?, ?, ?, ?)
    `).run(v.inventory_id, v.name, v.price, v.is_default || 0);
    res.sendStatus(201);
  } else {
    db.prepare(`
      UPDATE variations 
      SET inventory_id=?, name=?, price=?, is_default=?, updated_at=CURRENT_TIMESTAMP 
      WHERE id=?
    `).run(v.inventory_id, v.name, v.price, v.is_default, v.id);
    res.sendStatus(200);
  }
});

// Delete variation
app.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM variations WHERE id=?").run(req.params.id);
  res.sendStatus(200);
});

export default app;
