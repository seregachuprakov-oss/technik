import type { PoolClient } from "pg";
import { withTransaction } from "@/server/db";
import { parseCsv } from "./parseCsv";

/**
 * Импорт выгрузки из 1С (CSV от "Печать этикеток и ценников" / "Отчёты").
 * Идентичность товара — ТОЛЬКО onec_id (GUID номенклатуры), никогда имя/артикул:
 * они могут повторяться или меняться у поставщика, а GUID в 1С стабилен.
 *
 * Ожидаемые колонки CSV (см. docs/sample-imports/example_1c_export.csv):
 *   onec_id, article, barcode, name, category_slug, subcategory, unit,
 *   price, price_source, stock, description
 *
 * Правила:
 *  - manual_override=true на товаре ИЛИ конкретное поле в overridden_fields —
 *    импорт это поле не трогает (карточку правил человек в админке).
 *  - stock и производная is_available (скрытие при нулевом остатке) обновляются
 *    ВСЕГДА — это физический остаток с кассы, защищать его от обновления нельзя,
 *    иначе на сайте будет "в наличии" то, чего физически нет на складе.
 *  - каждое реальное изменение поля логируется в product_change_log.
 *  - если файл не распарсился вообще — импорт помечается failed, существующие
 *    товары/остатки НЕ трогаются (транзакция не коммитится).
 */

export interface ImportSummary {
  importRunId: string;
  status: "ok" | "partial" | "failed";
  rowsTotal: number;
  rowsCreated: number;
  rowsUpdated: number;
  rowsSkipped: number;
  rowsErrored: number;
  errors: string[];
}

const OVERRIDABLE_FIELDS = ["name", "description", "price", "category", "subcategory"] as const;

function slugify(input: string): string {
  const translit: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
    к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
    х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  const lower = input.toLowerCase();
  let out = "";
  for (const ch of lower) out += translit[ch] ?? ch;
  return out
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "item";
}

async function ensureUniqueSlug(client: PoolClient, base: string, onecId: string): Promise<string> {
  const { rows } = await client.query<{ slug: string }>("SELECT slug FROM products WHERE slug LIKE $1", [`${base}%`]);
  const existing = new Set(rows.map((r) => r.slug));
  if (!existing.has(base)) return base;
  const suffix = onecId.replace(/[^a-z0-9]/gi, "").slice(-6).toLowerCase() || Math.random().toString(36).slice(2, 8);
  const candidate = `${base}-${suffix}`;
  return existing.has(candidate) ? `${candidate}-${Date.now().toString(36).slice(-4)}` : candidate;
}

export async function runImport(csvText: string, filename: string, actor = "admin"): Promise<ImportSummary> {
  const { rows } = parseCsv(csvText);
  const errors: string[] = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errored = 0;

  if (rows.length === 0) {
    const importRunId = await recordRun(filename, "failed", 0, 0, 0, 0, 0, "Файл пуст или не распознан как CSV", actor);
    return { importRunId, status: "failed", rowsTotal: 0, rowsCreated: 0, rowsUpdated: 0, rowsSkipped: 0, rowsErrored: 0, errors: [csvText.length === 0 ? "Пустой файл" : "Не найдены строки данных"] };
  }

  try {
    await withTransaction(async (client) => {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]!;
        const rowNo = i + 2; // с учётом заголовка, 1-based
        const onecId = r.onec_id?.trim();
        const name = r.name?.trim();
        const priceRub = Number((r.price ?? "").replace(",", "."));
        const stock = Number(r.stock ?? "0");

        if (!onecId) {
          errors.push(`Строка ${rowNo}: нет onec_id — пропущена (идентичность товара без GUID 1С не гарантирована)`);
          errored++;
          continue;
        }
        if (!name) {
          errors.push(`Строка ${rowNo}: нет наименования — пропущена`);
          errored++;
          continue;
        }
        if (!Number.isFinite(priceRub) || priceRub < 0) {
          errors.push(`Строка ${rowNo} (${name}): некорректная цена "${r.price}" — пропущена`);
          errored++;
          continue;
        }
        if (!Number.isFinite(stock)) {
          errors.push(`Строка ${rowNo} (${name}): некорректный остаток "${r.stock}" — пропущена`);
          errored++;
          continue;
        }

        let categoryId: string | null = null;
        if (r.category_slug) {
          const cat = await client.query<{ id: string }>("SELECT id FROM categories WHERE slug = $1", [r.category_slug.trim()]);
          categoryId = cat.rows[0]?.id ?? null;
          if (!categoryId) errors.push(`Строка ${rowNo} (${name}): категория "${r.category_slug}" не найдена — товар сохранён без категории`);
        }

        const priceKopecks = Math.round(priceRub * 100);
        const priceSource = (r.price_source?.trim() as "import" | "confirmed" | "estimated_placeholder") || "import";
        const isAvailableFromStock = stock > 0;

        const existing = await client.query<{
          id: string; name: string; description: string; price_kopecks: number; category_id: string | null;
          subcategory: string | null; is_available: boolean; manual_override: boolean; overridden_fields: string[];
        }>(
          `SELECT id, name, description, price_kopecks, category_id, subcategory, is_available, manual_override, overridden_fields FROM products WHERE onec_id = $1`,
          [onecId],
        );

        if (existing.rows.length === 0) {
          const slug = await ensureUniqueSlug(client, slugify(name), onecId);
          const ins = await client.query<{ id: string }>(
            `INSERT INTO products (onec_id, category_id, subcategory, slug, name, description, article, barcode, unit,
                                    price_kopecks, price_source, stock_qty, stock_updated_at, is_available, sort)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9,'шт'),$10,$11,$12,now(),$13,100)
             RETURNING id`,
            [onecId, categoryId, r.subcategory?.trim() || null, slug, name, r.description?.trim() || "", r.article?.trim() || null,
              r.barcode?.trim() || null, r.unit?.trim() || null, priceKopecks, priceSource, stock, isAvailableFromStock],
          );
          await logChange(client, ins.rows[0]!.id, "created", null, name, "import_create", "import");
          created++;
          continue;
        }

        const p = existing.rows[0]!;
        const protected_ = (field: string) => p.manual_override || p.overridden_fields.includes(field);
        let changedAny = false;

        if (!protected_("name") && p.name !== name) {
          await logChange(client, p.id, "name", p.name, name, "import_update", "import");
          await client.query("UPDATE products SET name = $2 WHERE id = $1", [p.id, name]);
          changedAny = true;
        }
        const newDescription = r.description?.trim() ?? p.description;
        if (!protected_("description") && r.description !== undefined && p.description !== newDescription) {
          await logChange(client, p.id, "description", p.description, newDescription, "import_update", "import");
          await client.query("UPDATE products SET description = $2 WHERE id = $1", [p.id, newDescription]);
          changedAny = true;
        }
        if (!protected_("price") && p.price_kopecks !== priceKopecks) {
          await logChange(client, p.id, "price_kopecks", String(p.price_kopecks), String(priceKopecks), "import_update", "import");
          await client.query("UPDATE products SET price_kopecks = $2, price_source = $3 WHERE id = $1", [p.id, priceKopecks, priceSource]);
          changedAny = true;
        }
        if (!protected_("category") && categoryId && p.category_id !== categoryId) {
          await logChange(client, p.id, "category_id", p.category_id, categoryId, "import_update", "import");
          await client.query("UPDATE products SET category_id = $2 WHERE id = $1", [p.id, categoryId]);
          changedAny = true;
        }
        if (!protected_("subcategory") && r.subcategory !== undefined && p.subcategory !== r.subcategory.trim()) {
          await client.query("UPDATE products SET subcategory = $2 WHERE id = $1", [p.id, r.subcategory.trim() || null]);
          changedAny = true;
        }

        // Остаток и наличие — всегда из импорта (физическая правда с кассы).
        await client.query("UPDATE products SET stock_qty = $2, stock_updated_at = now() WHERE id = $1", [p.id, stock]);
        if (p.is_available !== isAvailableFromStock) {
          await logChange(
            client, p.id, "is_available", String(p.is_available), String(isAvailableFromStock),
            isAvailableFromStock ? "auto_unhide_restock" : "auto_hide_zero_stock", "system",
          );
          await client.query("UPDATE products SET is_available = $2 WHERE id = $1", [p.id, isAvailableFromStock]);
          changedAny = true;
        }
        await client.query("UPDATE products SET updated_at = now() WHERE id = $1", [p.id]);

        if (changedAny) updated++;
        else skipped++;
      }
    });
  } catch (err) {
    const importRunId = await recordRun(filename, "failed", rows.length, 0, 0, 0, rows.length, `Импорт прерван: ${String(err)}`, actor);
    return { importRunId, status: "failed", rowsTotal: rows.length, rowsCreated: 0, rowsUpdated: 0, rowsSkipped: 0, rowsErrored: rows.length, errors: [String(err)] };
  }

  const status: ImportSummary["status"] = errored === 0 ? "ok" : errored === rows.length ? "failed" : "partial";
  const importRunId = await recordRun(filename, status, rows.length, created, updated, skipped, errored, errors.slice(0, 20).join(" | ") || null, actor);
  return { importRunId, status, rowsTotal: rows.length, rowsCreated: created, rowsUpdated: updated, rowsSkipped: skipped, rowsErrored: errored, errors };
}

async function logChange(client: PoolClient, productId: string, field: string, oldValue: string | null, newValue: string | null, reason: string, actor: string) {
  await client.query(
    `INSERT INTO product_change_log (product_id, field, old_value, new_value, reason, actor) VALUES ($1,$2,$3,$4,$5,$6)`,
    [productId, field, oldValue, newValue, reason, actor],
  );
}

async function recordRun(
  filename: string, status: "ok" | "partial" | "failed", total: number, created: number, updated: number,
  skipped: number, errored: number, errorSummary: string | null, actor: string,
): Promise<string> {
  const { pool } = await import("@/server/db");
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO import_runs (filename, status, rows_total, rows_created, rows_updated, rows_skipped, rows_errored, error_summary, actor, finished_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now()) RETURNING id`,
    [filename, status, total, created, updated, skipped, errored, errorSummary, actor],
  );
  return rows[0]!.id;
}

export const OVERRIDABLE_FIELD_NAMES = OVERRIDABLE_FIELDS;
