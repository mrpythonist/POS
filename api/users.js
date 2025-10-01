// api/users.js
import express from "express";
import bodyParser from "body-parser";
import btoa from "btoa";
import db from "../db/db.js"; // ✅ Import shared DB connection

const app = express();
app.use(bodyParser.json());

// Ensure users table exists
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

// Routes
app.get("/", (req, res) => {
  res.send("Users API");
});

app.get("/user/:userId", (req, res) => {
  if (!req.params.userId) return res.status(500).send("ID field is required.");
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(parseInt(req.params.userId));
  res.send(row || {});
});

app.get("/logout/:userId", (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (!userId) return res.status(400).send("ID field is required.");

    const stmt = db.prepare("UPDATE users SET status = ? WHERE id = ?");
    stmt.run("Logged Out_" + new Date(), userId);

    res.sendStatus(200);
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).send({ error: "Failed to logout", details: err.message });
  }
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = btoa(req.body.password);

  const row = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);

  if (row) {
    const status = "Logged In_" + new Date();
    db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, row.id);
  }

  res.send(row || {});
});

app.get("/all", (req, res) => {
  const rows = db.prepare("SELECT * FROM users").all();
  res.send(rows);
});

app.delete("/user/:userId", (req, res) => {
  db.prepare("DELETE FROM users WHERE id = ?").run(parseInt(req.params.userId));
  res.sendStatus(200);
});

app.post("/post", (req, res) => {
  const User = {
    id: req.body.id ? parseInt(req.body.id) : Math.floor(Date.now() / 1000),
    username: req.body.username,
    password: btoa(req.body.password),
    fullname: req.body.fullname,
    perm_products: req.body.perm_products === "on" ? 1 : 0,
    perm_categories: req.body.perm_categories === "on" ? 1 : 0,
    perm_transactions: req.body.perm_transactions === "on" ? 1 : 0,
    perm_users: req.body.perm_users === "on" ? 1 : 0,
    perm_settings: req.body.perm_settings === "on" ? 1 : 0,
    status: ""
  };

  if (req.body.id === "") {
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
    res.send(User);
  } else {
    db.prepare(`
      UPDATE users 
      SET username=?, password=?, fullname=?, perm_products=?, perm_categories=?, perm_transactions=?, perm_users=?, perm_settings=? 
      WHERE id=?
    `).run(
      User.username,
      User.password,
      User.fullname,
      User.perm_products,
      User.perm_categories,
      User.perm_transactions,
      User.perm_users,
      User.perm_settings,
      User.id
    );
    res.sendStatus(200);
  }
});

app.get("/check", (req, res) => {
  let row = db.prepare("SELECT * FROM users WHERE id = 1").get();
  if (!row) {
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
  }
  res.sendStatus(200);
});

export default app;
