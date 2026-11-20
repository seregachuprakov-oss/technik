import { query } from "@/server/db";
import { ImportForm } from "@/components/admin/ImportForm";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  const runs = await query(
    `SELECT filename, status, rows_total, rows_created, rows_updated, rows_skipped, rows_errored, error_summary, actor, started_at, finished_at
     FROM import_runs ORDER BY started_at DESC LIMIT 30`,
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Импорт из 1С</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
        Загрузите CSV-выгрузку из 1С (отчёт/печать этикеток и ценников, сохранённый как CSV UTF-8). Колонки:
        onec_id, article, barcode, name, category_slug, subcategory, unit, price, price_source, stock, description.
        Пример — docs/sample-imports/example_1c_export.csv в репозитории. Товары, отмеченные «ручная правка»,
        импорт не изменит (кроме остатка), это защищает правки сотрудника.
      </p>

      <div className="mt-6">
        <ImportForm />
      </div>

      <h2 className="mt-10 font-display text-lg font-semibold">История импортов</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-line)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface)] text-left text-[var(--color-muted)]">
            <tr><th className="p-3">Файл</th><th className="p-3">Статус</th><th className="p-3">Строк</th><th className="p-3">+/~/0/!</th><th className="p-3">Когда</th></tr>
          </thead>
          <tbody>
            {runs.length === 0 && <tr><td className="p-3 text-[var(--color-muted)]" colSpan={5}>Импортов пока не было</td></tr>}
            {runs.map((r, i) => {
              const row = r as Record<string, unknown>;
              return (
                <tr key={i} className="border-t border-[var(--color-line)]">
                  <td className="p-3">{String(row.filename)}</td>
                  <td className="p-3">
                    <span className={
                      row.status === "ok" ? "text-emerald-300" : row.status === "partial" ? "text-amber-300" : "text-red-300"
                    }>
                      {String(row.status)}
                    </span>
                  </td>
                  <td className="p-3">{String(row.rows_total)}</td>
                  <td className="p-3 text-[var(--color-muted)]">{String(row.rows_created)}/{String(row.rows_updated)}/{String(row.rows_skipped)}/{String(row.rows_errored)}</td>
                  <td className="p-3 text-[var(--color-muted)]">{row.finished_at ? new Date(String(row.finished_at)).toLocaleString("ru-RU") : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
