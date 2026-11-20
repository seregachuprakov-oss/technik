import { query } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function AdminChangelogPage() {
  const rows = await query(
    `SELECT l.field, l.old_value, l.new_value, l.reason, l.actor, l.created_at, p.name AS product_name, p.id AS product_id
     FROM product_change_log l JOIN products p ON p.id = l.product_id ORDER BY l.created_at DESC LIMIT 200`,
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Журнал изменений товаров</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">Кто/когда/почему менял цену, описание, видимость — включая автоматическое скрытие при нулевом остатке.</p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--color-line)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface)] text-left text-[var(--color-muted)]">
            <tr><th className="p-3">Когда</th><th className="p-3">Товар</th><th className="p-3">Поле</th><th className="p-3">Было → Стало</th><th className="p-3">Кто/почему</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const row = r as Record<string, unknown>;
              return (
                <tr key={i} className="border-t border-[var(--color-line)]">
                  <td className="p-3 text-[var(--color-muted)]">{new Date(String(row.created_at)).toLocaleString("ru-RU")}</td>
                  <td className="p-3">{String(row.product_name)}</td>
                  <td className="p-3">{String(row.field)}</td>
                  <td className="p-3 text-[var(--color-muted)]">{String(row.old_value ?? "—")} → {String(row.new_value ?? "—")}</td>
                  <td className="p-3 text-[var(--color-muted)]">{String(row.actor)} · {String(row.reason)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
