import { query } from "@/server/db";
import { ImportForm } from "@/components/admin/ImportForm";
import { PageHeader, Panel, Table, EmptyRow, StatusPill } from "@/components/admin/ui";
import { HelpTooltip } from "@/components/ui/HelpTooltip";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  const runs = await query(
    `SELECT filename, status, rows_total, rows_created, rows_updated, rows_skipped, rows_errored,
            error_summary, actor, started_at, finished_at
     FROM import_runs ORDER BY started_at DESC LIMIT 30`,
  );

  return (
    <div>
      <PageHeader
        title="Импорт из 1С"
        description="Загрузка CSV-выгрузки: обновляет цены, описания и — главное — остатки по складу."
        help="Товар узнаётся по onec_id (GUID номенклатуры 1С), а не по названию или артикулу: названия у поставщиков меняются, артикулы повторяются, GUID — нет. Поэтому одна и та же позиция между выгрузками не раздваивается, а ваши правки остаются на месте."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
        <Panel title="Загрузить файл" help="Файл должен быть в UTF-8. Если 1С отдала Windows-1251 (кириллица в кракозябрах) — откройте в Excel или LibreOffice и пересохраните как «CSV UTF-8». Разделитель и запятая, и точка с запятой подойдут.">
          <div className="p-4">
            <ImportForm />
          </div>
        </Panel>

        <aside className="rounded-lg border border-line bg-card p-4 text-[12.5px] leading-relaxed text-muted">
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-text">
            Колонки файла
            <HelpTooltip title="Колонки файла" side="left">
              Порядок колонок не важен, важны заголовки первой строки. Строка без onec_id или без
              названия пропускается и попадает в список ошибок — остальные при этом импортируются.
              Образец лежит в репозитории: docs/sample-imports/example_1c_export.csv
            </HelpTooltip>
          </div>
          <code className="mt-2 block rounded-sm bg-sunk px-2 py-2 text-[11.5px] leading-relaxed text-text">
            onec_id, article, barcode, name, category_slug, subcategory, unit, price, price_source,
            stock, description
          </code>
          <ul className="mt-3 space-y-2">
            <li>
              <span className="font-medium text-text">Остаток обновляется всегда.</span> Ноль в колонке
              stock снимает товар с продажи на сайте, поступление возвращает — это физический склад,
              его нельзя «защитить» от обновления.
            </li>
            <li>
              <span className="font-medium text-text">Ручные правки переживают импорт.</span> Поля,
              отмеченные в карточке как защищённые, выгрузка не трогает.
            </li>
            <li>
              <span className="font-medium text-text">Сбой ничего не портит.</span> Если файл не
              разобрался, импорт помечается как failed, а каталог остаётся прежним.
            </li>
          </ul>
        </aside>
      </div>

      <h2 className="mb-3 mt-8 font-display text-[15px] font-semibold">История импортов</h2>
      <Panel
        footer="Колонка «+ / ~ / 0 / !» — создано, обновлено, без изменений, ошибок."
      >
        <Table head={["Файл", "Статус", "Строк", "+ / ~ / 0 / !", "Когда", "Замечания"]}>
          {runs.length === 0 && <EmptyRow colSpan={6}>Импортов ещё не было.</EmptyRow>}
          {runs.map((r, i) => {
            const row = r as Record<string, unknown>;
            const status = String(row.status);
            return (
              <tr key={i}>
                <td className="px-4 py-2.5">{String(row.filename)}</td>
                <td className="px-4 py-2.5">
                  <StatusPill tone={status === "ok" ? "ok" : status === "partial" ? "warn" : "bad"}>
                    {status === "ok" ? "успешно" : status === "partial" ? "частично" : "сбой"}
                  </StatusPill>
                </td>
                <td className="tnum px-4 py-2.5">{String(row.rows_total)}</td>
                <td className="tnum px-4 py-2.5 text-muted">
                  {String(row.rows_created)} / {String(row.rows_updated)} / {String(row.rows_skipped)} /{" "}
                  {String(row.rows_errored)}
                </td>
                <td className="tnum whitespace-nowrap px-4 py-2.5 text-muted">
                  {row.finished_at ? new Date(String(row.finished_at)).toLocaleString("ru-RU") : "—"}
                </td>
                <td className="max-w-72 px-4 py-2.5 text-[12px] text-muted">
                  {row.error_summary ? String(row.error_summary).slice(0, 140) : "—"}
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}
