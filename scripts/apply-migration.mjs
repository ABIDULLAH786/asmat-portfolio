import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

function loadEnv(file) {
  const text = readFileSync(file, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv(resolve(repoRoot, ".env.local"));

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error("SUPABASE_DB_URL is not set in .env.local");
  process.exit(1);
}

const migrationPath = process.argv[2];
if (!migrationPath) {
  console.error("Usage: node scripts/apply-migration.mjs <path-to-sql-file>");
  process.exit(1);
}

const sql = readFileSync(resolve(repoRoot, migrationPath), "utf8");

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log(`Applying ${migrationPath} ...`);
  await client.query(sql);
  console.log("Migration applied successfully.");

  const check = await client.query(
    "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'site_settings' and column_name = 'brand_name'"
  );
  if (check.rowCount === 1) {
    console.log("Verified: site_settings.brand_name exists.");
  } else {
    console.error("Verification failed: brand_name column not found after migration.");
    process.exitCode = 1;
  }
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
