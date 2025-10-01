// api/inventory.js
import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import fs from "fs";
import path from "path";
import db from "../db/db.js"; // better-sqlite3 connection

export default function createInventoryRoutes(uploadDir) {
  const app = express();
  app.use(bodyParser.json());

  // Ensure uploads dir exists
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  // Multer file storage
  const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, callback) => {
      callback(null, Date.now() + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage });

  // Routes
  app.get("/", (req, res) => {
    res.send("Inventory API (SQLite - better-sqlite3)");
  });

  // Get single product
  app.get("/product/:productId", (req, res) => {
    try {
      const { productId } = req.params;
      const row = db.prepare("SELECT * FROM inventory WHERE id = ?").get(productId);
      if (!row) return res.status(404).send("Product not found");
      res.json(row);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  // Get all products
  app.get("/products", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM inventory ORDER BY id DESC").all();
      res.json(rows);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  // Insert or Update product
  app.post("/product", upload.single("imagename"), (req, res) => {
    try {
      let image = req.body.img || "";
      if (req.file) image = req.file.filename;

      // Handle image deletion
      if (req.body.remove == 1 && req.body.img) {
        const oldPath = path.join(uploadDir, req.body.img);
        try { fs.unlinkSync(oldPath); } catch (err) { console.error(err); }
        if (!req.file) image = "";
      }

      const { id, price, category_id, name, description, status } = req.body;
      const now = new Date().toISOString();

      if (!id) {
        // Insert new product
        const stmt = db.prepare(`
          INSERT INTO inventory (name, category_id, price, description, img, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
          name,
          category_id || null,
          price,
          description || "",
          image,
          status === "0" ? 0 : 1
        );
        res.json({
          id: result.lastInsertRowid,
          name,
          category_id: category_id || null,
          price,
          description: description || "",
          img: image,
          status: status === "0" ? 0 : 1,
          created_at: now,
          updated_at: now
        });
      } else {
        // Update existing product
        const stmt = db.prepare(`
          UPDATE inventory
          SET name=?, category_id=?, price=?, description=?, img=?, status=?, updated_at=?
          WHERE id=?
        `);
        const result = stmt.run(
          name,
          category_id || null,
          price,
          description || "",
          image,
          status === "0" ? 0 : 1,
          now,
          id
        );
        if (result.changes === 0) return res.status(404).send("Product not found");
        res.sendStatus(200);
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  // Delete product
  app.delete("/product/:productId", (req, res) => {
    try {
      const { productId } = req.params;
      const result = db.prepare("DELETE FROM inventory WHERE id = ?").run(productId);
      if (result.changes === 0) return res.status(404).send("Product not found");
      res.sendStatus(200);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  return app;
}
