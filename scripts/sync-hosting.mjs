import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const from = path.join(root, "dist");
const to = path.join(root, "public_html");

if (!fs.existsSync(from)) {
  console.error("dist/ not found. Run: npm run build");
  process.exit(1);
}

fs.cpSync(from, to, { recursive: true, force: true });
console.log("Synced dist/ -> public_html/ (cPanel deploy folder)");
