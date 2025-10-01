// api/audit_logs.js
import express from "express";
import bodyParser from "body-parser";
import db from "../db/db.js";

const app = express();
app.use(bodyParser.json());

// Get all logs
app.get("/all", (req, res) => {
  const rows = db.prepare("SELECT * FROM audit_logs ORDER BY timestamp DESC").all();
  res.send(rows);
});

// Get logs by user
app.get("/user/:userId", (req, res) => {
  const rows = db.prepare("SELECT * FROM audit_logs WHERE user_id = ? ORDER BY timestamp DESC").all(req.params.userId);
  res.send(rows);
});

// Insert log
app.post("/post", (req, res) => {
  const log = req.body;
  db.prepare(`
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_value, new_value) 
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(log.user_id, log.action, log.table_name, log.record_id, log.old_value, log.new_value);
  res.sendStatus(201);
});

// Clear all logs
app.delete("/clear", (req, res) => {
  db.prepare("DELETE FROM audit_logs").run();
  res.sendStatus(200);
});

export default app;
