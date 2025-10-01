// api/payments.js
import express from "express";
import bodyParser from "body-parser";
import db from "../db/db.js";

const app = express();
app.use(bodyParser.json());

// Get payments by transaction
app.get("/:transactionId", (req, res) => {
  const rows = db.prepare("SELECT * FROM payments WHERE transaction_id = ?").all(req.params.transactionId);
  res.send(rows);
});

// Add / Update payment
app.post("/post", (req, res) => {
  const p = req.body;
  if (!p.id) {
    db.prepare(`
      INSERT INTO payments (transaction_id, payment_type, payment_info, amount)
      VALUES (?, ?, ?, ?)
    `).run(p.transaction_id, p.payment_type, p.payment_info, p.amount);
    res.sendStatus(201);
  } else {
    db.prepare(`
      UPDATE payments 
      SET transaction_id=?, payment_type=?, payment_info=?, amount=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(p.transaction_id, p.payment_type, p.payment_info, p.amount, p.id);
    res.sendStatus(200);
  }
});

// Delete payment
app.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM payments WHERE id=?").run(req.params.id);
  res.sendStatus(200);
});

export default app;
