import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import { config as loadEnv } from "dotenv";

// Next.js читает .env.local сам, но отдельные скрипты (tsx) — нет.
loadEnv({ path: ".env.local" });
loadEnv();

const MIGRATIONS_DIR = path.join(process.cwd(), "db", "migrations");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL не задан (см. .env.local.example)");
    process.exit(1);
  }
  const pool = new Pool({ connectionString });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    text PRIMARY KEY,
      applied_at  timestamptz NOT NULL DEFAULT now()
    );
  `);

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();
  const { rows: appliedRows } = await pool.query<{ filename: string }>(
    "SELECT filename FROM schema_migrations",
  );
  const applied = new Set(appliedRows.map((r) => r.filename));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`= ${file} (уже применена)`);
      continue;
    }
    const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf-8");
    const client = await pool.connect();
    let failure: unknown = null;
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`+ ${file} применена`);
    } catch (err) {
      await client.query("ROLLBACK");
      failure = err;
    } finally {
      client.release();
    }
    if (failure) {
      console.error(`! ${file} упала:`, failure);
      await pool.end();
      process.exit(1);
    }
  }

  await pool.end();
  console.log("Миграции готовы.");
}

main();
