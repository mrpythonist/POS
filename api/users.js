// api/users.js
import express from "express";
import bodyParser from "body-parser";
import btoa from "btoa";
import db from "../db/db.js"; // ✅ Shared DB

const app = express();
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
  res.send("Users API");
});

// Get user by ID
app.get("/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  if (!userId) return res.status(400).send("ID field is required.");

  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  res.send(row || {});
});

// Logout
app.get("/logout/:userId", (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (!userId) return res.status(400).send("ID field is required.");

    const status = "Logged Out_" + new Date().toISOString();
    db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, userId);

    res.sendStatus(200);
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).send({ error: "Failed to logout", details: err.message });
  }
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const encodedPassword = btoa(password);

  const row = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?")
    .get(username, encodedPassword);

  if (row) {
    const status = "Logged In_" + new Date().toISOString();
    db.prepare("UPDATE users SET status = ?, last_login = CURRENT_TIMESTAMP WHERE id = ?")
      .run(status, row.id);
  }

  res.send(row || {});
});

// Get all users
app.get("/all", (req, res) => {
  const rows = db.prepare("SELECT * FROM users").all();
  res.send(rows);
});

// Delete user
app.delete("/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  db.prepare("DELETE FROM users WHERE id = ?").run(userId);
  res.sendStatus(200);
});

// Create or update user
app.post("/post", (req, res) => {
  const User = {
    id: req.body.id ? parseInt(req.body.id) : Math.floor(Date.now() / 1000),
    username: req.body.username,
    password: btoa(req.body.password),
    fullname: req.body.fullname,
    role: req.body.role || "cashier",
    status: ""
  };

  if (!req.body.id) {
    // Insert new
    db.prepare(`
      INSERT INTO users (id, username, password, fullname, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      User.id,
      User.username,
      User.password,
      User.fullname,
      User.role,
      User.status
    );
    res.send(User);
  } else {
    // Update existing
    db.prepare(`
      UPDATE users 
      SET username=?, password=?, fullname=?, role=? 
      WHERE id=?
    `).run(
      User.username,
      User.password,
      User.fullname,
      User.role,
      User.id
    );
    res.sendStatus(200);
  }
});

// Ensure admin exists
app.get("/check", (req, res) => {
  let row = db.prepare("SELECT * FROM users WHERE id = 1").get();
  if (!row) {
    const User = {
      id: 1,
      username: "admin",
      password: btoa("admin"),
      fullname: "Administrator",
      role: "admin",
      status: ""
    };
    db.prepare(`
      INSERT INTO users (id, username, password, fullname, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      User.id,
      User.username,
      User.password,
      User.fullname,
      User.role,
      User.status
    );
  }
  res.sendStatus(200);
});

export default app;
