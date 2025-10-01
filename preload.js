// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  quit: () => ipcRenderer.send("app-quit"),
  reload: () => ipcRenderer.send("app-reload"),

  getImgPath: () => ipcRenderer.invoke("get-img-path"),

  // Simple key-value storage via main process
  storeGet: (key) => ipcRenderer.invoke("store-get", key),
  storeSet: (key, value) => ipcRenderer.invoke("store-set", { key, value }),
  storeDelete: (key) => ipcRenderer.invoke("store-delete", key),

  getMacAddress: () => ipcRenderer.invoke("get-mac-address"),
});
