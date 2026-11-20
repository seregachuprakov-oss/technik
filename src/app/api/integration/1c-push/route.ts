import { NextRequest, NextResponse } from "next/server";
import { runImport } from "@/server/import/run";

/**
 * Путь A живой интеграции с 1С (docs/INTEGRATION_1C_GUIDE.md, раздел "Путь A").
 *
 * Принимает ТОТ ЖЕ формат CSV, что уже парсит src/server/import/run.ts
 * (см. docs/sample-imports/example_1c_export.csv) — никакой отдельной
 * логики сопоставления onec_id/защиты ручных правок/журнала изменений
 * здесь нет, всё идёт через ровно ту же функцию runImport, которой
 * пользуется обычная ручная загрузка в /admin/import. Это не новый путь
 * импорта, а новый способ ДОСТАВКИ того же файла — автоматический вместо
 * ручного клика в админке.
 *
 * Авторизация — простой bearer-токен из ONEC_PUSH_TOKEN (см. .env.local.example).
 * Это разумно для одного агента на одном кассовом компьютере одного магазина —
 * не полноценный OAuth, но большего тут не нужно: достаточно секрета, которого
 * никто посторонний не знает, передаваемого по HTTPS.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const expectedToken = process.env.ONEC_PUSH_TOKEN;
  if (!expectedToken) {
    return NextResponse.json({ error: "ONEC_PUSH_TOKEN не настроен на сервере — Путь A ещё не включён" }, { status: 503 });
  }

  const auth = req.headers.get("authorization") ?? "";
  const presented = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  if (!presented || presented !== expectedToken) {
    return NextResponse.json({ error: "Неверный или отсутствующий токен" }, { status: 401 });
  }

  const csvText = await req.text();
  if (!csvText) {
    return NextResponse.json({ error: "Пустое тело запроса — ожидается CSV-текст выгрузки 1С" }, { status: 400 });
  }

  const filename = req.headers.get("x-filename") || `1c-push-${new Date().toISOString()}.csv`;

  try {
    const summary = await runImport(csvText, filename, "onec_push_agent");
    const httpStatus = summary.status === "failed" ? 422 : 200;
    return NextResponse.json(summary, { status: httpStatus });
  } catch (err) {
    return NextResponse.json({ error: `Импорт упал: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  // Удобная проверка "жив ли endpoint" без токена и без импорта — используется
  // агентом (scripts/1c-push-agent.ps1) и человеком при первой настройке Пути A.
  return NextResponse.json({ ok: true, endpoint: "POST /api/integration/1c-push", configured: Boolean(process.env.ONEC_PUSH_TOKEN) });
}
