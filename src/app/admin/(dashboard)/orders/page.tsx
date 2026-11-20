import { query } from "@/server/db";
import { formatRub } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await query(
    `SELECT order_no, status, customer_name, customer_phone, fulfillment, total_kopecks, is_demo, created_at FROM orders ORDER BY created_at DESC LIMIT 100`,
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Заказы</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">Эквайринга нет — все заказы демо: подтверждение и оплата по телефону.</p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--color-line)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface)] text-left text-[var(--color-muted)]">
            <tr><th className="p-3">№</th><th className="p-3">Клиент</th><th className="p-3">Телефон</th><th className="p-3">Способ</th><th className="p-3">Сумма</th><th className="p-3">Статус</th><th className="p-3">Создан</th></tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td className="p-3 text-[var(--color-muted)]" colSpan={7}>Заказов пока нет</td></tr>}
            {orders.map((o, i) => {
              const row = o as Record<string, unknown>;
              return (
                <tr key={i} className="border-t border-[var(--color-line)]">
                  <td className="p-3">{String(row.order_no)}</td>
                  <td className="p-3">{String(row.customer_name)}</td>
                  <td className="p-3">{String(row.customer_phone)}</td>
                  <td className="p-3 text-[var(--color-muted)]">{row.fulfillment === "pickup" ? "самовывоз" : "доставка"}</td>
                  <td className="p-3">{formatRub(Number(row.total_kopecks))}</td>
                  <td className="p-3 text-[var(--color-muted)]">ожидает подтверждения</td>
                  <td className="p-3 text-[var(--color-muted)]">{new Date(String(row.created_at)).toLocaleString("ru-RU")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
