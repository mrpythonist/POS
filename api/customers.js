// api/customers.js
import express from "express";
import bodyParser from "body-parser";
import db from "../db/db.js"; // better-sqlite3 connection

const app = express();
app.use(bodyParser.json());

// Test route
app.get("/", (req, res) => {
  res.send("Customer API (SQLite - better-sqlite3)");
});

// GET /customer/:customerId → fetch single customer
app.get("/customer/:customerId", (req, res) => {
  const { customerId } = req.params;
  if (!customerId) return res.status(400).send("ID field is required.");

  try {
    const row = db.prepare("SELECT * FROM customers WHERE id = ?").get(customerId);
    if (!row) return res.status(404).send("Customer not found");
    res.json(row);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET /all → fetch all customers
app.get("/all", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM customers ORDER BY id DESC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST /customer → insert new customer
app.post("/customer", (req, res) => {
  const { name, email, phone, address } = req.body;

  try {
    const stmt = db.prepare(
      "INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)"
    );
    const result = stmt.run(name, email, phone, address);

    res.json({ id: result.lastInsertRowid, name, email, phone, address});
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// DELETE /customer/:customerId → delete customer
app.delete("/customer/:customerId", (req, res) => {
  const { customerId } = req.params;

  try {
    const stmt = db.prepare("DELETE FROM customers WHERE id = ?");
    const result = stmt.run(customerId);

    if (result.changes === 0) return res.status(404).send("Customer not found");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// PUT /customer → update customer
app.put("/customer", (req, res) => {
  const { id, name, email, phone, address } = req.body;
  if (!id) return res.status(400).send("ID field is required.");

  try {
    const now = new Date().toISOString();
    const stmt = db.prepare(
      "UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, updated_at = ? WHERE id = ?"
    );
    const result = stmt.run(name, email, phone, address, now, id);

    if (result.changes === 0) return res.status(404).send("Customer not found");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default app;
