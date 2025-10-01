import express from "express";
import http from "http";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

import customerRoutes from "./api/customers.js";
import categoryRoutes from "./api/categories.js";
import settingsRoutes from "./api/settings.js";
import userRoutes from "./api/users.js";
import transactionRoutes from "./api/transactions.js";

import inventoryRoutesFactory from "./api/inventory.js";
import { app as electronApp } from "electron";
import path from "path";

const uploadDir = path.join(electronApp.getPath("userData"), "uploads", "product_image");


const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8001;

console.log("Server started");

// ESM dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api/images", express.static(uploadDir));
app.use("/api/assets", express.static(path.join(__dirname, "assets")));

// ✅ Works in Express v5+
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-type,Accept,X-Access-Token,X-Key"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.get("/", (req, res) => {
  res.send("POS Server Online.");
});

// API routes
app.use("/api/inventory", inventoryRoutesFactory(uploadDir));
app.use("/api/customers", customerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/users", userRoutes);
app.use("/api", transactionRoutes);


server.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));