import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const vars = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
const env = loadEnvFile(envPath);

if (!env) {
  console.error("Missing .env file. Copy .env.example to .env and set your Supabase credentials.");
  process.exit(1);
}

const placeholders = ["YOUR_PROJECT", "your_supabase", "example.com", "changeme"];
let failed = false;

for (const key of required) {
  const value = env[key]?.trim();
  if (!value) {
    console.error(`Missing required variable: ${key}`);
    failed = true;
    continue;
  }
  if (placeholders.some((p) => value.toUpperCase().includes(p.toUpperCase()))) {
    console.error(`${key} still contains placeholder text — set a real Supabase value.`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log("Environment OK for production build.");
