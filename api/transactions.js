// api/transactions.js
import express from "express";
import bodyParser from "body-parser";
import db from "../db/db.js";
import Inventory from "./inventory.js";

const app = express();
app.use(bodyParser.json());

// =======================
// Routes
// =======================

app.get("/", (req, res) => {
  res.send("Transactions API (better-sqlite3)");
});

// ✅ Get all transactions
app.get("/all", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM transactions ORDER BY id DESC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ Get on-hold transactions
app.get("/on-hold", (req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM transactions WHERE ref_number != '' AND status = 0")
      .all();
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ Get pending customer orders
app.get("/customer-orders", (req, res) => {
  try {
    const rows = db
      .prepare(
        "SELECT * FROM transactions WHERE customer_id IS NOT NULL AND status = 0 AND ref_number = ''"
      )
      .all();
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ Get transactions by date range
app.get("/by-date", (req, res) => {
  try {
    const { start, end, status = 0, user = 0, till = 0 } = req.query;

    let query =
      "SELECT * FROM transactions WHERE date >= ? AND date <= ? AND status = ?";
    let params = [new Date(start).toJSON(), new Date(end).toJSON(), parseInt(status)];

    if (parseInt(user) !== 0) {
      query += " AND user_id = ?";
      params.push(parseInt(user));
    }
    if (parseInt(till) !== 0) {
      query += " AND till = ?";
      params.push(parseInt(till));
    }

    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ Create new transaction
app.post("/new", (req, res) => {
  try {
    const t = req.body;

    // -----------------------------
    // 1️⃣ Handle transaction-level discount code
    // -----------------------------
    let transactionDiscount = t.discount || 0;
    if (t.discount_code) {
      const now = new Date();

      const discount = db
        .prepare("SELECT * FROM discounts WHERE code = ?")
        .get(t.discount_code);

      if (!discount) {
        return res.status(400).send("Invalid discount code");
      }

      const startDate = discount.start_date ? new Date(discount.start_date) : null;
      const endDate = discount.end_date ? new Date(discount.end_date) : null;

      if (
        (endDate && now > endDate) || 
        (discount.usage_limit !== null && discount.used_count >= discount.usage_limit)
      ) {
        return res.status(400).send("Invalid or expired discount code");
      }

      // Increment usage
      db.prepare(`
        UPDATE discounts 
        SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(discount.id);

      transactionDiscount = discount.type === 0
        ? discount.value // percentage discount can be applied in your logic later
        : discount.value; // fixed discount
    }

    // -----------------------------
    // 2️⃣ Insert transaction without totals yet
    // -----------------------------
    const stmt = db.prepare(`
      INSERT INTO transactions (
        order_number, ref_number, customer_id, discount, discount_code, tax, paid,
        change, order_type, status, date, till, mac, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      t.order_number,
      t.ref_number || "",
      t.customer_id || null,
      transactionDiscount,
      t.discount_code || null,
      t.tax || 0,
      t.paid || 0,
      t.change || 0,
      t.order_type || 0,
      t.status || 0,
      t.date || new Date().toISOString(),
      t.till || 0,
      t.mac || "",
      t.user_id || null
    );

    const transactionId = result.lastInsertRowid;

    // -----------------------------
    // 3️⃣ Save items and calculate subtotal
    // -----------------------------
    let calculatedSubtotal = 0;
    if (Array.isArray(t.items)) {
      const itemStmt = db.prepare(`
        INSERT INTO transaction_items (transaction_id, inventory_id, variation_id, quantity, price, discount)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const item of t.items) {
        // If variation exists, use variation price
        const price = item.variation_price ?? item.price ?? 0;

        itemStmt.run(
          transactionId,
          item.id,
          item.variation_id || null,
          item.quantity || 1,
          price,
          item.discount || 0
        );

        calculatedSubtotal += (price * (item.quantity || 1) - (item.discount || 0));
      }
    }

    // -----------------------------
    // 4️⃣ Calculate total and update transaction
    // -----------------------------
    const total = calculatedSubtotal - (transactionDiscount || 0) + (t.tax || 0);

    db.prepare(`
      UPDATE transactions
      SET subtotal = ?, total = ?
      WHERE id = ?
    `).run(calculatedSubtotal, total, transactionId);

    res.json({ id: transactionId, subtotal: calculatedSubtotal, total });

  } catch (err) {
    res.status(500).send(err.message);
  }
});




// ✅ Update transaction
app.put("/update", (req, res) => {
  try {
    const t = req.body;

    // Update transaction details
    const changes = db
      .prepare(`
        UPDATE transactions
        SET ref_number=?, customer_id=?, subtotal=?, discount=?, discount_code=?, tax=?, total=?,
            paid=?, change=?, order_type=?, status=?, date=?, till=?, mac=?, user_id=?,
            updated_at=CURRENT_TIMESTAMP
        WHERE id=?
      `)
      .run(
        t.ref_number || "",
        t.customer_id || null,
        t.subtotal || 0,
        t.discount || 0,
        t.discount_code || null,
        t.tax || 0,
        t.total || 0,
        t.paid || 0,
        t.change || 0,
        t.order_type || 0,
        t.status || 0,
        t.date || new Date().toISOString(),
        t.till || 0,
        t.mac || "",
        t.user_id || null,
        t.id
      ).changes;

    if (changes === 0) return res.status(404).send("Transaction not found");

    // Rollback discount usage if transaction is canceled (status = 2)
    if (t.status === 2 && t.discount_code) {
      db.prepare(`
        UPDATE discounts
        SET used_count = CASE WHEN used_count > 0 THEN used_count - 1 ELSE 0 END,
            updated_at = CURRENT_TIMESTAMP
        WHERE code = ?
      `).run(t.discount_code);
    }

    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// ✅ Delete transaction
app.post("/delete", (req, res) => {
  try {
    const { orderId } = req.body;

    db.prepare("DELETE FROM transaction_items WHERE transaction_id = ?").run(orderId);
    const changes = db.prepare("DELETE FROM transactions WHERE id = ?").run(orderId)
      .changes;

    if (changes === 0) return res.status(404).send("Transaction not found");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ✅ Get single transaction with items
app.get("/:transactionId", (req, res) => {
  try {
    const transactionId = req.params.transactionId;

    const transaction = db
      .prepare("SELECT * FROM transactions WHERE id = ?")
      .get(transactionId);

    if (!transaction) return res.status(404).send("Transaction not found");

    const items = db
      .prepare(`
        SELECT 
          ti.*, 
          i.name, 
          i.category_id,
          (ti.price * ti.quantity - ti.discount) AS total
        FROM transaction_items ti
        JOIN inventory i ON i.id = ti.inventory_id
        WHERE ti.transaction_id = ?
      `)
      .all(transactionId);

    transaction.items = items;

    // Optional: recalculate transaction total dynamically
    transaction.calculated_subtotal = items.reduce((acc, item) => acc + item.total, 0);
    transaction.calculated_total = transaction.calculated_subtotal - (transaction.discount || 0) + (transaction.tax || 0);

    res.json(transaction);
  } catch (err) {
    res.status(500).send(err.message);
  }
});



export default app;
