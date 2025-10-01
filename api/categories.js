// api/categories.js
import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import fs from "fs";
import path from "path";
import db from "../db/db.js";

export default function createCategoryRoutes(uploadDir) {
  const app = express();
  app.use(bodyParser.json());

  // Ensure uploads dir exists
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  // Multer storage
  const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage });

  // ✅ Test route
  app.get("/", (req, res) => {
    res.send("Category API (SQLite - better-sqlite3)");
  });

  // ✅ Get all categories
  app.get("/all", (req, res) => {
    try {
      const rows = db.prepare(`SELECT * FROM categories ORDER BY id DESC`).all();
      res.json(rows);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  // ✅ Insert category
  app.post("/category", upload.single("catImg"), (req, res) => {
    try {
      let image = req.body.img || "";
      if (req.file) image = req.file.filename;

      // Handle remove flag
      if (req.body.remove == 1 && req.body.img) {
        const oldPath = path.join(uploadDir, req.body.img);
        try { fs.unlinkSync(oldPath); } catch (err) { console.error(err); }
        if (!req.file) image = "";
      }

      const { name, parent_id = null } = req.body;
      if (!name) return res.status(400).send("Category name required");

      const stmt = db.prepare(`
        INSERT INTO categories (name, parent_id, img, created_at, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      const result = stmt.run(name, parent_id, image);

      res.json({ 
        id: result.lastInsertRowid, 
        name, 
        parent_id, 
        img: image 
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  // ✅ Update category
  app.put("/category", upload.single("catImg"), (req, res) => {
    try {
      let image = req.body.img || "";
      if (req.file) image = req.file.filename;

      if (req.body.remove == 1 && req.body.img) {
        const oldPath = path.join(uploadDir, req.body.img);
        try { fs.unlinkSync(oldPath); } catch (err) { console.error(err); }
        if (!req.file) image = "";
      }

      const { id, name, parent_id = null } = req.body;
      if (!id || !name) return res.status(400).send("ID and name required");

      const stmt = db.prepare(`
        UPDATE categories
        SET name = ?, parent_id = ?, img = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      const result = stmt.run(name, parent_id, image, id);

      if (result.changes === 0) return res.status(404).send("Category not found");
      res.json({ id, name, parent_id, img: image });
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  // ✅ Delete category
  app.delete("/category/:categoryId", (req, res) => {
    try {
      const { categoryId } = req.params;
      const stmt = db.prepare("DELETE FROM categories WHERE id = ?");
      const result = stmt.run(categoryId);

      if (result.changes === 0) return res.status(404).send("Category not found");
      res.sendStatus(200);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  return app;
}
