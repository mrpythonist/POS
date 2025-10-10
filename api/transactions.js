// api/transactions.js
import express from "express";
import bodyParser from "body-parser";
import db from "../db/db.js";
import createInventoryRoutes from "./inventory.js";

const Inventory = createInventoryRoutes("./uploads");

const app = express();
app.use(bodyParser.json());



// Routes
app.get("/", (req, res) => {
  res.send("Transactions API (better-sqlite3)");
});

app.get("/all", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM transactions").all();
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/on-hold", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM transactions WHERE ref_number != '' AND status = 0").all();
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/customer-orders", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM transactions WHERE customer != 'Walk in customer' AND status = 0 AND ref_number = ''").all();
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/by-date", (req, res) => {
  try {
    let startDate = new Date(req.query.start).toJSON();
    let endDate = new Date(req.query.end).toJSON();
    let status = parseInt(req.query.status);
    let user = parseInt(req.query.user);
    let till = parseInt(req.query.till);

    let query = "SELECT * FROM transactions WHERE date >= ? AND date <= ? AND status = ?";
    let params = [startDate, endDate, status];

    if (user !== 0) {
      query += " AND user_id = ?";
      params.push(user);
    }
    if (till !== 0) {
      query += " AND till = ?";
      params.push(till);
    }

    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/new", (req, res) => {
  try {
    const t = req.body;
    db.prepare(`
      INSERT INTO transactions (id, ref_number, status, customer, date, user, order_type, discount, gst, sc, till, subtotal, total, paid, payment_method, account_type, account_no, items)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      t.id,
      t.ref_number || "",
      t.status || 0,
      t.customer ? JSON.stringify(t.customer) : JSON.stringify({}),
      t.date || new Date().toJSON(),
      t.user || "Anonymous",
      t.order_type || "N/A",
      t.discount || 0,
      t.gst || 0,
      t.sc || 0,
      t.till || 0,
      t.subtotal || 0,
      t.total || 0,
      t.paid || 0,
      t.payment_method || "",
      t.account_type || "",
      t.account_no || "",
      JSON.stringify(t.items || [])
    );

    if (t.paid >= t.total && Array.isArray(t.items)) {
      Inventory.decrementInventory(t.items);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

app.put("/new", (req, res) => {
  try {
    const t = req.body;
    t.id = t.id || t.order; // <-- fix here

    const changes = db.prepare(`
      UPDATE transactions
      SET ref_number = ?, status = ?, customer = ?, date = ?, user = ?, order_type = ?, discount = ?, gst = ?, sc = ?, till = ?, subtotal = ?, total = ?, paid = ?, payment_method = ?, account_type = ?, account_no = ?, items = ?
      WHERE id = ?
    `).run(
      t.ref_number || "",
      t.status || 0,
      t.customer ? JSON.stringify(t.customer) : JSON.stringify({}),
      t.date || new Date().toJSON(),
      t.user || "Anonymous",
      t.order_type || "N/A",
      t.discount || 0,
      t.gst || 0,
      t.sc || 0,
      t.till || 0,
      t.subtotal || 0,
      t.total || 0,
      t.paid || 0,
      t.payment_method || "",
      t.account_type || "",
      t.account_no || "",
      JSON.stringify(t.items || []),
      t.id
    ).changes;

    if (changes === 0) return res.status(404).send("Transaction not found");
    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

app.post("/delete", (req, res) => {
  try {
    const id = req.body.id;
    const changes = db.prepare("DELETE FROM transactions WHERE id = ?").run(id).changes;
    if (changes === 0) return res.status(404).send("Transaction not found");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/:transactionId", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM transactions WHERE id = ?").get(req.params.transactionId);
    res.json(row || {});
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default app;
