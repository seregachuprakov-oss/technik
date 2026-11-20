import { notFound } from "next/navigation";
import { Check, Phone, Clock, Store } from "lucide-react";
import { getOrderByToken } from "@/server/orders";
import { formatRub } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { site } from "@/config/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Заказ принят" };

export default async function OrderStatusPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getOrderByToken(token);
  if (!data) notFound();
  const { order, items } = data as { order: Record<string, unknown>; items: Record<string, unknown>[] };
  const pickup = order.fulfillment === "pickup";

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 sm:py-20">
      <div className="text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-ok-soft text-ok">
          <Check size={26} strokeWidth={2.6} />
        </div>
        <h1 className="mt-5 font-display text-[clamp(1.6rem,4vw,2.2rem)] font-semibold">
          Заказ №{String(order.order_no)} принят
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-muted">
          Менеджер проверит позиции на полке и позвонит на {String(order.customer_phone)}.
          Пока заказ не подтверждён по телефону, он считается бронью.
        </p>
      </div>

      <div className="mt-9 overflow-hidden rounded-lg border border-line bg-card">
        <div className="border-b border-line px-5 py-3 text-[11px] uppercase tracking-[0.12em] text-faint">
          Состав заказа
        </div>
        <ul className="divide-y divide-line">
          {items.map((it, i) => (
            <li key={i} className="flex justify-between gap-4 px-5 py-3 text-[14px]">
              <span className="text-muted">
                {String(it.product_name)} <span className="tnum text-faint">× {String(it.qty)}</span>
              </span>
              <span className="tnum shrink-0 font-medium">{formatRub(Number(it.line_total_kopecks))}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t border-line bg-sunk/60 px-5 py-4">
          <span className="text-[14px] text-muted">Итого</span>
          <span className="tnum font-display text-xl font-semibold">{formatRub(Number(order.total_kopecks))}</span>
        </div>
      </div>

      <ul className="mt-6 space-y-3 rounded-lg border border-line bg-card p-5 text-[13.5px] text-muted">
        <li className="flex items-start gap-2.5">
          <Store size={15} className="mt-0.5 shrink-0 text-accent" />
          {pickup ? `Самовывоз: ${site.address}` : "Доставка по Котласу — условия обсудим по телефону"}
        </li>
        <li className="flex items-start gap-2.5">
          <Clock size={15} className="mt-0.5 shrink-0 text-accent" />
          {site.hours}
        </li>
        <li className="flex items-start gap-2.5">
          <Phone size={15} className="mt-0.5 shrink-0 text-accent" />
          Не дождались звонка — наберите сами:{" "}
          <a href={`tel:${site.phoneHref}`} className="font-medium text-accent-ink underline-offset-4 hover:underline">
            {site.phone}
          </a>
        </li>
      </ul>

      <p className="mt-5 text-center text-[12px] leading-relaxed text-faint">
        Ссылку на эту страницу можно сохранить: по ней видно состав и сумму заказа.
        Оплата на сайте не проводилась.
      </p>

      <div className="mt-7 flex justify-center">
        <Button href="/catalog" variant="outline">Вернуться в каталог</Button>
      </div>
    </div>
  );
}
