import { readFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

/**
 * Идемпотентный сид: категории таксономии + демо-товары через РЕАЛЬНЫЙ
 * импорт-пайплайн (src/server/import/run.ts) из docs/sample-imports/example_1c_export.csv —
 * это то же самое, что сделает владелец вручную в /admin/import, а не отдельный
 * короткий путь мимо логики защиты ручных правок и журнала изменений.
 */
async function main() {
  process.env.DATABASE_URL = process.env.DATABASE_URL; // noop, для ясности что переменная уже должна быть в env
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const { categoriesSeed } = await import("../src/config/site");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const c of categoriesSeed) {
      await client.query(
        `INSERT INTO categories (slug, name, description, sort) VALUES ($1,$2,$3,$4)
         ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, sort=EXCLUDED.sort`,
        [c.slug, c.name, c.description, c.sort],
      );
    }
    await client.query("COMMIT");
    console.log(`+ ${categoriesSeed.length} категории`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Сид категорий упал:", e);
    process.exitCode = 1;
    return;
  } finally {
    client.release();
  }

  const { runImport } = await import("../src/server/import/run");
  const csvPath = path.join(process.cwd(), "docs", "sample-imports", "example_1c_export.csv");
  const csvText = await readFile(csvPath, "utf-8");
  const summary = await runImport(csvText, "example_1c_export.csv (seed)", "seed");
  console.log(
    `Импорт демо-товаров: статус=${summary.status}, всего=${summary.rowsTotal}, создано=${summary.rowsCreated}, обновлено=${summary.rowsUpdated}, пропущено=${summary.rowsSkipped}, ошибок=${summary.rowsErrored}`,
  );
  if (summary.errors.length) console.log("Замечания импорта:", summary.errors.join(" | "));

  await pool.end();
  console.log("Сид готов.");
}

main().catch((e) => {
  console.error("Сид упал:", e);
  process.exitCode = 1;
});
