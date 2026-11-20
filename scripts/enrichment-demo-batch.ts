import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

/**
 * Демо-партия для проверки AI-пайплайна обогащения карточек (часть 1 ТЗ,
 * "Test it end-to-end on a demo batch"). Запускать ВРУЧНУЮ на сервере, где
 * настроен ANTHROPIC_API_KEY/GEMINI_API_KEY или CONTENT_FACTORY_RELAY_URL:
 *
 *   npx tsx scripts/enrichment-demo-batch.ts
 *
 * Что делает:
 *  1. Заводит ~12 демо-товаров (реальные, широко известные модели
 *     Makita/Bosch/DeWalt с характеристиками из общих знаний модели, НЕ
 *     взятыми с живого сайта — см. ограничение ТЗ "никогда не обходить
 *     защиту от ботов/не скрейпить vseinstrumenti.ru или другие сайты")
 *     через ТОТ ЖЕ runImport, что и обычный импорт из 1С — чтобы пайплайн
 *     обогащения получал входные факты ровно в том виде, в котором их
 *     получил бы настоящий товар.
 *  2. Помечает их is_demo=true И is_visible=false — это ЖИВАЯ прод-база
 *     магазина «Техник», демо-товары НЕ должны появляться в каталоге для
 *     настоящих посетителей сайта ни на секунду.
 *  3. Запускает createEnrichmentDraft (текст + иллюстрация) для 2 реальных
 *     товаров магазина и для всех демо-товаров, печатает before/after в консоль.
 *  4. НИЧЕГО не подтверждает автоматически — все черновики остаются
 *     pending_review, как и требует ТЗ. Можно зайти в /admin/enrichment и
 *     увидеть их там же, где увидел бы сотрудник.
 */

const DEMO_CSV_HEADER = "onec_id,article,barcode,name,category_slug,subcategory,unit,price,price_source,stock,description";

interface DemoRow {
  onecId: string;
  article: string;
  name: string;
  categorySlug: string;
  subcategory: string;
  price: number;
  stock: number;
  description: string; // "как из 1С" — сухой список характеристик, источник фактов для AI
}

// Характеристики — широко опубликованные данные производителей (общие знания
// модели), НЕ скачанные с какого-либо конкретного сайта в момент написания
// этого скрипта. Цена — приблизительная оценка (price_source=estimated_placeholder),
// это демо-партия, не реальный прайс магазина.
const DEMO_ROWS: DemoRow[] = [
  { onecId: "DEMO-makita-hp1631k", article: "HP1631K", name: "Дрель ударная Makita HP1631K", categorySlug: "power-tools", subcategory: "Дрели и шуруповёрты", price: 7900, stock: 3,
    description: "Мощность 710 Вт, патрон 13 мм, 0-2900 об/мин, 0-46000 уд/мин, реверс, в комплекте кейс." },
  { onecId: "DEMO-makita-dhp482z", article: "DHP482Z", name: "Шуруповёрт-дрель аккумуляторный Makita DHP482Z 18V", categorySlug: "power-tools", subcategory: "Дрели и шуруповёрты", price: 8900, stock: 2,
    description: "Аккумулятор 18В LXT (без АКБ и ЗУ, корпус), патрон 13 мм, крутящий момент 54 Нм, 2 скорости: 0-400 и 0-1900 об/мин." },
  { onecId: "DEMO-bosch-gsb13re", article: "GSB 13 RE", name: "Дрель ударная Bosch GSB 13 RE", categorySlug: "power-tools", subcategory: "Дрели и шуруповёрты", price: 6500, stock: 4,
    description: "Мощность 600 Вт, патрон 13 мм, 0-2800 об/мин, реверс, регулировка оборотов." },
  { onecId: "DEMO-bosch-gws7-115", article: "GWS 7-115", name: "Угловая шлифмашина Bosch GWS 7-115", categorySlug: "power-tools", subcategory: "Болгарки (УШМ)", price: 5200, stock: 5,
    description: "Мощность 720 Вт, диаметр диска 115 мм, 11000 об/мин, резьба шпинделя M14." },
  { onecId: "DEMO-dewalt-dcd777", article: "DCD777", name: "Шуруповёрт-дрель аккумуляторный DeWalt DCD777 18V", categorySlug: "power-tools", subcategory: "Дрели и шуруповёрты", price: 9400, stock: 2,
    description: "Аккумулятор 18В XR (корпус, без АКБ и ЗУ), патрон 13 мм, крутящий момент 65 Нм, бесщёточный двигатель." },
  { onecId: "DEMO-makita-9557nb", article: "9557NB", name: "Угловая шлифмашина Makita 9557NB", categorySlug: "power-tools", subcategory: "Болгарки (УШМ)", price: 4800, stock: 6,
    description: "Мощность 840 Вт, диаметр диска 115 мм, 11000 об/мин, вес 1.8 кг." },
  { onecId: "DEMO-bosch-psb1800li2", article: "PSB 1800 LI-2", name: "Дрель-шуруповёрт аккумуляторная Bosch PSB 1800 LI-2 18V", categorySlug: "power-tools", subcategory: "Дрели и шуруповёрты", price: 7200, stock: 3,
    description: "Аккумулятор 18В, патрон 10 мм, крутящий момент 63 Нм, 2 скорости, ударный режим." },
  { onecId: "DEMO-makita-hr2470", article: "HR2470", name: "Перфоратор Makita HR2470", categorySlug: "power-tools", subcategory: "Перфораторы", price: 11500, stock: 2,
    description: "Мощность 780 Вт, патрон SDS-plus, энергия удара 2.7 Дж, 3 режима работы (сверление/удар/долбление), вес 2.8 кг." },
  { onecId: "DEMO-bosch-gbh226dre", article: "GBH 2-26 DRE", name: "Перфоратор Bosch GBH 2-26 DRE", categorySlug: "power-tools", subcategory: "Перфораторы", price: 12900, stock: 2,
    description: "Мощность 830 Вт, патрон SDS-plus, энергия удара 2.7 Дж, антивибрационная система." },
  { onecId: "DEMO-dewalt-dwe4257", article: "DWE4257", name: "Угловая шлифмашина DeWalt DWE4257", categorySlug: "power-tools", subcategory: "Болгарки (УШМ)", price: 7800, stock: 3,
    description: "Мощность 1500 Вт, диаметр диска 125 мм, защита от перезапуска." },
  { onecId: "DEMO-bosch-gks190", article: "GKS 190", name: "Дисковая пила Bosch GKS 190", categorySlug: "power-tools", subcategory: "Пилы", price: 8600, stock: 2,
    description: "Мощность 1400 Вт, диаметр диска 190 мм, глубина пропила 70 мм при 90°." },
  { onecId: "DEMO-makita-uc4051a", article: "UC4051A", name: "Цепная пила электрическая Makita UC4051A", categorySlug: "power-tools", subcategory: "Пилы", price: 13500, stock: 1,
    description: "Мощность 1800 Вт, длина шины 40 см, автоматическая смазка цепи." },
];

function csvEscape(value: string | number): string {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildDemoCsv(): string {
  const lines = [DEMO_CSV_HEADER];
  for (const r of DEMO_ROWS) {
    lines.push([
      r.onecId, r.article, "", r.name, r.categorySlug, r.subcategory, "шт",
      r.price, "estimated_placeholder", r.stock, csvEscape(r.description),
    ].join(","));
  }
  return lines.join("\n");
}

async function main() {
  const { pool, query, isDbConfigured } = await import("../src/server/db");
  if (!isDbConfigured()) {
    console.error("DATABASE_URL не задан — запускать на сервере, где настроена БД «Техник».");
    process.exitCode = 1;
    return;
  }

  const { runImport } = await import("../src/server/import/run");
  const csvText = buildDemoCsv();
  const importSummary = await runImport(csvText, "enrichment-demo-batch.csv", "demo-batch");
  console.log(`Импорт демо-товаров: статус=${importSummary.status}, создано=${importSummary.rowsCreated}, обновлено=${importSummary.rowsUpdated}`);
  if (importSummary.errors.length) console.log("Замечания:", importSummary.errors.join(" | "));

  await query(`UPDATE products SET is_demo = true, is_visible = false WHERE onec_id LIKE 'DEMO-%'`);
  console.log("Демо-товары помечены is_demo=true, is_visible=false (не видны в живом каталоге).");

  const { createEnrichmentDraft } = await import("../src/server/enrichment/run");

  const targets = await query<{ id: string; name: string; onec_id: string | null; description: string; is_demo: boolean }>(
    `SELECT id, name, onec_id, description, is_demo FROM products
     WHERE onec_id LIKE 'DEMO-%' OR onec_id IN (
       'f3a1c2e0-71b4-4a2d-9c3a-0001glue0001', 'b7d4e9f1-3c2a-48a1-9e5b-0002stpl0002'
     ) ORDER BY is_demo, name`,
  );

  console.log(`\nЗапускаю обогащение для ${targets.length} товаров (2 реальных + ${targets.length - 2} демо)...\n`);

  for (const p of targets) {
    console.log("=".repeat(70));
    console.log(`Товар: ${p.name}${p.is_demo ? " [ДЕМО]" : " [РЕАЛЬНЫЙ ТОВАР МАГАЗИНА]"}`);
    console.log(`ДО (текущее описание в карточке): ${p.description || "(пусто)"}`);
    try {
      const draft = await createEnrichmentDraft(p.id, { generateImage: true, actor: "demo-batch" });
      console.log(`ПОСЛЕ (черновик AI, status=${draft.status}):`);
      console.log(draft.draft_description);
      if (draft.cross_check_warnings.length > 0) {
        console.log("Предупреждения сверки:");
        for (const w of draft.cross_check_warnings) console.log(`  - ${w.note}`);
      }
      console.log(`Иллюстрация: ${draft.draft_image_path ?? `не сгенерирована (${draft.draft_image_error ?? "причина неизвестна"})`}`);
    } catch (err) {
      console.log(`ОШИБКА генерации: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log("\nГотово. Все черновики — в статусе pending_review, см. /admin/enrichment. Ничего не опубликовано автоматически.");
  await pool.end();
}

main().catch((err) => {
  console.error("Демо-партия упала:", err);
  process.exitCode = 1;
});
