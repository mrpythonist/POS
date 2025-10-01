// start.js
import { app, BrowserWindow, ipcMain, screen } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import contextMenu from "electron-context-menu";
import { handleSquirrelEvent } from "./installers/setupEvents.js";
import Store from "electron-store";
import macaddress from "macaddress";
import "./server.js"; // Start Express API server

// __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Electron Store ---
const store = new Store();

// --- Handle Squirrel (Windows installer) ---
if (handleSquirrelEvent()) process.exit(0);

// --- Global reference for window ---
let mainWindow;

// --- Function to create Electron window ---
function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const screenSize = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: screenSize.width,
    height: screenSize.height,
    frame: false,
    minWidth: 1200,
    minHeight: 750,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, // Required for security
      nodeIntegration: false,
    },
  });

  mainWindow.maximize();
  mainWindow.show();

  // Load local HTML (all scripts are included via <script> tags in HTML)
  mainWindow.loadFile(path.join(__dirname, "index.html")).catch(err => {
    console.error("Failed to load index.html:", err);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// --- Electron app lifecycle ---
app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (!mainWindow) createWindow();
});

// --- Context menu (right click) ---
contextMenu({
  prepend: (params, browserWindow) => [
    {
      label: "DevTools",
      click: (_, win) => win && win.webContents.toggleDevTools(),
    },
    {
      label: "Reload",
      click: () => mainWindow && mainWindow.reload(),
    },
  ],
});

// --- IPC handlers ---
// Electron Store
ipcMain.handle("store-get", (_, key) => store.get(key));
ipcMain.handle("store-set", (_, { key, value }) => store.set(key, value));
ipcMain.handle("store-delete", (_, key) => store.delete(key));

// MAC address
ipcMain.handle("get-mac-address", async () => {
  return new Promise((resolve, reject) => {
    macaddress.one((err, mac) => (err ? reject(err) : resolve(mac)));
  });
});

// Serve product images
const userDataPath = app.getPath("userData");
const imgDir = path.join(userDataPath, "uploads", "product_image");

ipcMain.handle("get-img-path", async (_, imgName) => {
  if (!imgName) return null;

  const fullPath = path.join(imgDir, imgName);
  if (!fs.existsSync(fullPath)) return null;

  return `file://${fullPath}`;
});

// --- Optional: Quit / reload from renderer ---
ipcMain.on("app-quit", () => app.quit());
ipcMain.on("app-reload", () => mainWindow && mainWindow.reload());
