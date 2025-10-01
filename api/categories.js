import express from "express";
import bodyParser from "body-parser";
import db from "../db/db.js";

const app = express();

app.use(bodyParser.json());

// Create table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`).run();

// Test route
app.get("/", (req, res) => {
  res.send("Category API (SQLite - better-sqlite3)");
});

// GET /all → fetch all categories
app.get("/all", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM categories ORDER BY id DESC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST /category → insert new category
app.post("/category", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send("Category name required");

  try {
    const stmt = db.prepare("INSERT INTO categories (name) VALUES (?)");
    const result = stmt.run(name);
    console.log("Inserted row info:", result);
    res.json({ id: result.lastInsertRowid, name });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// DELETE /category/:categoryId → remove category
app.delete("/category/:categoryId", (req, res) => {
  const { categoryId } = req.params;

  try {
    const stmt = db.prepare("DELETE FROM categories WHERE id = ?");
    const result = stmt.run(categoryId);

    if (result.changes === 0) return res.status(404).send("Category not found");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// PUT /category → update category
app.put("/category", (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) return res.status(400).send("ID and name required");

  try {
    const stmt = db.prepare("UPDATE categories SET name = ? WHERE id = ?");
    const result = stmt.run(name, id);

    if (result.changes === 0) return res.status(404).send("Category not found");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default app;
