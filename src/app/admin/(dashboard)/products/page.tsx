import Link from "next/link";
import { query } from "@/server/db";
import { formatRub } from "@/lib/money";

interface Row {
  id: string; name: string; price_kopecks: number; stock_qty: number; is_available: boolean;
  is_visible: boolean; manual_override: boolean; category_name: string | null; onec_id: string | null;
}

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await query<Row>(
    `SELECT p.id, p.name, p.price_kopecks, p.stock_qty, p.is_available, p.is_visible, p.manual_override, p.onec_id, c.name AS category_name
     FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.sort, p.name`,
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Товары</h1>
      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--color-line)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface)] text-left text-[var(--color-muted)]">
            <tr>
              <th className="p-3">Название</th>
              <th className="p-3">Категория</th>
              <th className="p-3">Цена</th>
              <th className="p-3">Остаток</th>
              <th className="p-3">Статус</th>
              <th className="p-3">Источник</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-[var(--color-line)]">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-[var(--color-muted)]">{p.category_name ?? "—"}</td>
                <td className="p-3">{formatRub(p.price_kopecks)}</td>
                <td className="p-3">{p.stock_qty}</td>
                <td className="p-3">
                  {!p.is_visible ? (
                    <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-xs">скрыт</span>
                  ) : p.is_available ? (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">в наличии</span>
                  ) : (
                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300">нет в наличии</span>
                  )}
                </td>
                <td className="p-3">
                  {p.manual_override ? (
                    <span title="Карточку правил человек — импорт не переписывает защищённые поля" className="rounded-full bg-[var(--color-accent)]/20 px-2 py-0.5 text-xs text-[var(--color-accent-2)]">
                      ручная правка
                    </span>
                  ) : p.onec_id ? (
                    <span className="text-xs text-[var(--color-muted)]">из 1С</span>
                  ) : (
                    <span className="text-xs text-[var(--color-muted)]">создан в админке</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-[var(--color-accent)] hover:underline">изменить</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
