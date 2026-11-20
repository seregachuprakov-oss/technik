import { query } from "@/server/db";
import { formatRub } from "@/lib/money";
import { PageHeader, Panel, Table, EmptyRow, StatusPill } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await query(
    `SELECT order_no, status, customer_name, customer_phone, fulfillment, address, comment,
            total_kopecks, is_demo, created_at
     FROM orders ORDER BY created_at DESC LIMIT 100`,
  );

  return (
    <div>
      <PageHeader
        title="Заказы"
        description="Заявки с сайта. Пока менеджер не позвонил, заказ — это бронь: деньги не списаны, в кассу ничего не ушло."
        help="Эквайринга у магазина нет, поэтому каждый заказ помечен как демо: покупатель видел на сайте предупреждение, что оплата происходит в магазине. Порядок работы: позвонить по указанному телефону, проверить позиции на полке, подтвердить сумму, отложить до конца дня."
      />

      <Panel>
        <Table head={["№", "Клиент", "Телефон", "Способ", "Сумма", "Статус", "Создан"]}>
          {orders.length === 0 && <EmptyRow colSpan={7}>Заказов пока нет.</EmptyRow>}
          {orders.map((o, i) => {
            const row = o as Record<string, unknown>;
            return (
              <tr key={i} className="align-top transition-colors hover:bg-sunk/50">
                <td className="tnum px-4 py-2.5 font-medium">{String(row.order_no)}</td>
                <td className="px-4 py-2.5">
                  {String(row.customer_name)}
                  {row.comment ? (
                    <span className="mt-0.5 block max-w-64 text-[12px] text-muted">{String(row.comment)}</span>
                  ) : null}
                </td>
                <td className="tnum whitespace-nowrap px-4 py-2.5">
                  <a href={`tel:${String(row.customer_phone)}`} className="text-accent-ink hover:underline">
                    {String(row.customer_phone)}
                  </a>
                </td>
                <td className="px-4 py-2.5 text-muted">
                  {row.fulfillment === "pickup" ? "самовывоз" : "доставка"}
                  {row.address ? (
                    <span className="mt-0.5 block max-w-56 text-[12px] text-faint">{String(row.address)}</span>
                  ) : null}
                </td>
                <td className="tnum whitespace-nowrap px-4 py-2.5 font-medium">{formatRub(Number(row.total_kopecks))}</td>
                <td className="px-4 py-2.5">
                  <StatusPill tone="warn">ждёт звонка</StatusPill>
                </td>
                <td className="tnum whitespace-nowrap px-4 py-2.5 text-muted">
                  {new Date(String(row.created_at)).toLocaleString("ru-RU")}
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}
