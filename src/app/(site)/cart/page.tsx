"use client";
import Link from "next/link";
import { Minus, Plus, X, ShoppingCart, Store } from "lucide-react";
import { useCart } from "@/components/cart/store";
import { formatRub } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { site } from "@/config/site";

export default function CartPage() {
  const { items, setQty, removeItem, totalKopecks, count } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-xl bg-sunk text-faint">
          <ShoppingCart size={26} />
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold">В корзине пусто</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
          Откройте каталог — там то, что заведено на сайте. Если нужной позиции не видно,
          позвоните {site.phone}: на полке её может быть больше, чем на сайте.
        </p>
        <Button href="/catalog" className="mt-7">В каталог</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
      <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-semibold">Корзина</h1>
      <p className="mt-2 text-[14px] text-muted">
        Позиций: <span className="tnum font-medium text-text">{count}</span>
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-card p-4"
            >
              <Link
                href={`/catalog/${item.slug}`}
                className="min-w-40 flex-1 text-[15px] font-medium leading-snug transition-colors hover:text-accent-ink"
              >
                {item.name}
              </Link>

              <div className="inline-flex items-center rounded-md border border-line bg-paper">
                <button
                  onClick={() => setQty(item.productId, item.qty - 1)}
                  aria-label="Уменьшить количество"
                  className="grid size-9 place-items-center text-muted transition-colors hover:text-text"
                >
                  <Minus size={14} />
                </button>
                <span className="tnum w-8 text-center text-sm font-medium">{item.qty}</span>
                <button
                  onClick={() => setQty(item.productId, item.qty + 1)}
                  aria-label="Увеличить количество"
                  className="grid size-9 place-items-center text-muted transition-colors hover:text-text"
                >
                  <Plus size={14} />
                </button>
              </div>

              <span className="tnum w-28 text-right font-display text-[17px] font-semibold">
                {formatRub(item.priceKopecks * item.qty)}
              </span>

              <button
                onClick={() => removeItem(item.productId)}
                aria-label={`Убрать ${item.name}`}
                className="grid size-9 place-items-center rounded-md text-faint transition-colors hover:bg-bad-soft hover:text-bad"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>

        <aside className="rounded-lg border border-line bg-card p-5 lg:sticky lg:top-28">
          <div className="flex items-baseline justify-between">
            <span className="text-[14px] text-muted">Итого</span>
            <span className="tnum font-display text-2xl font-semibold">{formatRub(totalKopecks)}</span>
          </div>
          <Button href="/checkout" className="mt-4 w-full" size="lg">Оформить заказ</Button>
          <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-muted">
            <Store size={14} className="mt-px shrink-0 text-faint" />
            Деньги на сайте не списываются. Мы отложим позиции, позвоним с {site.phone} и
            подтвердим наличие — оплата на кассе.
          </p>
        </aside>
      </div>
    </div>
  );
}
