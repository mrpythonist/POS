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
      callback(null, Date.now() + path.extname(file.originalname)); // preserve extension
    },
  });
  const upload = multer({ storage });

 
  // Routes

  app.get("/", (req, res) => {
    res.send("Inventory API (SQLite - better-sqlite3)");
  });

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

  app.get("/products", (req, res) => {
    try {
      const rows = db.prepare("SELECT * FROM inventory ORDER BY id DESC").all();
      res.json(rows);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  // Add / Update product
  app.post("/product", upload.single("imagename"), (req, res) => {
    try {
      let image = req.body.img || "";

      if (req.file) image = req.file.filename;

      if (req.body.remove == 1 && req.body.img) {
        const oldPath = path.join(uploadDir, req.body.img);
        try { fs.unlinkSync(oldPath); } catch (err) { console.error(err); }
        if (!req.file) image = "";
      }

      const { id, price, category, quantity, name, stock } = req.body;

      if (!id) {
        const stmt = db.prepare(`
          INSERT INTO inventory (name, price, category, quantity, stock, img)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
          name,
          price,
          category,
          quantity || 0,
          stock === "on" ? 0 : 1,
          image
        );
        res.json({ id: result.lastInsertRowid, name, price, category, quantity, stock, img: image });
      } else {
        const stmt = db.prepare(`
          UPDATE inventory
          SET name=?, price=?, category=?, quantity=?, stock=?, img=?
          WHERE id=?
        `);
        const result = stmt.run(
          name,
          price,
          category,
          quantity || 0,
          stock === "on" ? 0 : 1,
          image,
          id
        );
        if (result.changes === 0) return res.status(404).send("Product not found");
        res.sendStatus(200);
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

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

  // SKU lookup
  app.post("/product/sku", (req, res) => {
    try {
      const { skuCode } = req.body;
      const row = db.prepare("SELECT * FROM inventory WHERE id = ?").get(skuCode);
      res.json(row || {});
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  // Decrement inventory
  app.decrementInventory = function (products) {
    try {
      for (const transactionProduct of products) {
        const product = db.prepare("SELECT * FROM inventory WHERE id = ?").get(transactionProduct.id);
        if (!product) continue;
        const updatedQuantity = parseInt(product.quantity || 0) - parseInt(transactionProduct.quantity);
        db.prepare("UPDATE inventory SET quantity = ? WHERE id = ?").run(updatedQuantity, product.id);
      }
    } catch (err) {
      console.error("Error decrementing inventory:", err.message);
    }
  };

  return app;
}
