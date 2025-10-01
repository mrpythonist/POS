import { app } from "electron";
import { spawn } from "child_process";
import path from "path";

export function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const appFolder = path.resolve(process.execPath, "..");
  const rootAtomFolder = path.resolve(appFolder, "..");
  const updateDotExe = path.resolve(path.join(rootAtomFolder, "Update.exe"));
  const exeName = path.basename(process.execPath);

  const spawnUpdate = (args) => {
    try {
      return spawn(updateDotExe, args, { detached: true });
    } catch {
      return null;
    }
  };

  const squirrelEvent = process.argv[1];

  switch (squirrelEvent) {
    case "--squirrel-install":
    case "--squirrel-updated":
      spawnUpdate(["--createShortcut", exeName]);
      setTimeout(() => app.quit(), 1000);
      return true;

    case "--squirrel-uninstall":
      spawnUpdate(["--removeShortcut", exeName]);
      setTimeout(() => app.quit(), 1000);
      return true;

    case "--squirrel-obsolete":
      app.quit();
      return true;

    default:
      return false;
  }
}