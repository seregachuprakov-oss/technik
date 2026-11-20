import { notFound } from "next/navigation";
import { getOrderByToken } from "@/server/orders";
import { formatRub } from "@/lib/money";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function OrderStatusPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getOrderByToken(token);
  if (!data) notFound();
  const { order, items } = data as { order: Record<string, unknown>; items: Record<string, unknown>[] };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <h1 className="font-display text-3xl font-bold">Заказ №{String(order.order_no)} принят</h1>
      <p className="mt-4 text-[var(--color-muted)]">
        Мы свяжемся с вами по телефону {String(order.customer_phone)} для подтверждения состава заказа и оплаты —
        онлайн-оплата на сайте не предусмотрена.
      </p>

      <div className="mt-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 text-left">
        {items.map((it, i) => (
          <div key={i} className="flex justify-between py-1 text-sm text-[var(--color-muted)]">
            <span>{String(it.product_name)} × {String(it.qty)}</span>
            <span>{formatRub(Number(it.line_total_kopecks))}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between border-t border-[var(--color-line)] pt-3 font-display text-lg font-bold">
          <span>Итого</span>
          <span>{formatRub(Number(order.total_kopecks))}</span>
        </div>
      </div>

      <p className="mt-6 text-xs text-[var(--color-muted)]">
        Статус: ожидает подтверждения. Это демонстрационный режим сайта — заказ сохранён, но не передан автоматически в кассу.
      </p>
      <Button href="/catalog" variant="outline" className="mt-8">Вернуться в каталог</Button>
    </div>
  );
}
