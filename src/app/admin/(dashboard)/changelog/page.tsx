import Link from "next/link";
import { query } from "@/server/db";
import { PageHeader, Panel, Table, EmptyRow } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const REASON_LABEL: Record<string, string> = {
  admin_edit: "правка в админке",
  admin_upload: "загрузка фото",
  import_create: "создан импортом",
  import_update: "обновлён импортом",
  auto_hide_zero_stock: "авто: остаток 0",
  auto_unhide_restock: "авто: поступление",
};

const FIELD_LABEL: Record<string, string> = {
  name: "название",
  description: "описание",
  price_kopecks: "цена",
  is_visible: "видимость",
  is_available: "наличие",
  manual_override: "ручная правка",
  image_path: "фото",
  category_id: "раздел",
  created: "создание",
};

export default async function AdminChangelogPage() {
  const rows = await query(
    `SELECT l.field, l.old_value, l.new_value, l.reason, l.actor, l.created_at,
            p.name AS product_name, p.id AS product_id
     FROM product_change_log l JOIN products p ON p.id = l.product_id
     ORDER BY l.created_at DESC LIMIT 200`,
  );

  return (
    <div>
      <PageHeader
        title="Журнал изменений"
        description="Кто, когда и почему поменял карточку: правка сотрудника, выгрузка из 1С или автоматика."
        help="Сюда попадают и автоматические действия: когда остаток уходит в ноль, система сама снимает товар с продажи и пишет об этом строку. Если покупатель жалуется, что цена на сайте была другой, ответ ищется здесь."
      />

      <Panel footer="Показаны последние 200 записей.">
        <Table head={["Когда", "Товар", "Поле", "Было → Стало", "Кто и почему"]}>
          {rows.length === 0 && <EmptyRow colSpan={5}>Журнал пуст.</EmptyRow>}
          {rows.map((r, i) => {
            const row = r as Record<string, unknown>;
            const field = String(row.field);
            return (
              <tr key={i} className="transition-colors hover:bg-sunk/50">
                <td className="tnum whitespace-nowrap px-4 py-2.5 text-muted">
                  {new Date(String(row.created_at)).toLocaleString("ru-RU")}
                </td>
                <td className="px-4 py-2.5">
                  <Link href={`/admin/products/${String(row.product_id)}`} className="hover:text-accent-ink">
                    {String(row.product_name)}
                  </Link>
                </td>
                <td className="px-4 py-2.5">{FIELD_LABEL[field] ?? field}</td>
                <td className="px-4 py-2.5 text-muted">
                  {truncate(row.old_value)} <span className="text-faint">→</span>{" "}
                  <span className="text-text">{truncate(row.new_value)}</span>
                </td>
                <td className="px-4 py-2.5 text-muted">
                  {String(row.actor)} · {REASON_LABEL[String(row.reason)] ?? String(row.reason)}
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}

function truncate(value: unknown): string {
  const s = value === null || value === undefined ? "—" : String(value);
  return s.length > 48 ? `${s.slice(0, 48)}…` : s;
}
