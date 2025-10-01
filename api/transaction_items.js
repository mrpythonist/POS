// api/transaction_items.js
import express from "express";
import bodyParser from "body-parser";
import db from "../db/db.js";

const app = express();
app.use(bodyParser.json());

// Get all items for a transaction
app.get("/:transactionId", (req, res) => {
  const rows = db.prepare("SELECT * FROM transaction_items WHERE transaction_id = ?").all(req.params.transactionId);
  res.send(rows);
});

// Add / Update transaction item
app.post("/post", (req, res) => {
  const item = req.body;
  if (!item.id) {
    db.prepare(`
      INSERT INTO transaction_items (transaction_id, inventory_id, variation_id, quantity, price, discount)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(item.transaction_id, item.inventory_id, item.variation_id || null, item.quantity, item.price, item.discount || 0);
    res.sendStatus(201);
  } else {
    db.prepare(`
      UPDATE transaction_items 
      SET transaction_id=?, inventory_id=?, variation_id=?, quantity=?, price=?, discount=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(item.transaction_id, item.inventory_id, item.variation_id, item.quantity, item.price, item.discount, item.id);
    res.sendStatus(200);
  }
});

// Delete item
app.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM transaction_items WHERE id=?").run(req.params.id);
  res.sendStatus(200);
});

export default app;
