import dotenv from "dotenv";
import path from "path";
import fs from "fs";

export function loadEnv() {
  let currentDir = __dirname;
  while (currentDir) {
    const envPath = path.join(currentDir, ".env");
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      return;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
  dotenv.config();
}

// Auto-run on import
loadEnv();
