"use client";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/components/cart/store";
import { formatRub } from "@/lib/money";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { items, setQty, removeItem, totalKopecks } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold">Корзина пуста</h1>
        <p className="mt-3 text-[var(--color-muted)]">Загляните в каталог — там всё, что есть сейчас в магазине.</p>
        <Button href="/catalog" className="mt-6">В каталог</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Корзина</h1>
      <div className="mt-8 divide-y divide-[var(--color-line)] rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 p-5">
            <Link href={`/catalog/${item.slug}`} className="flex-1 font-medium hover:text-[var(--color-accent)]">
              {item.name}
            </Link>
            <div className="flex items-center gap-2 rounded-full border border-[var(--color-line)]">
              <button onClick={() => setQty(item.productId, item.qty - 1)} className="p-2"><Minus size={14} /></button>
              <span className="w-6 text-center text-sm">{item.qty}</span>
              <button onClick={() => setQty(item.productId, item.qty + 1)} className="p-2"><Plus size={14} /></button>
            </div>
            <span className="w-24 text-right font-display font-semibold">{formatRub(item.priceKopecks * item.qty)}</span>
            <button onClick={() => removeItem(item.productId)} className="text-[var(--color-muted)] hover:text-[var(--color-text)]">
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-lg text-[var(--color-muted)]">Итого</span>
        <span className="font-display text-2xl font-bold">{formatRub(totalKopecks)}</span>
      </div>

      <Button href="/checkout" className="mt-6 w-full">Оформить заказ</Button>
      <p className="mt-3 text-center text-xs text-[var(--color-muted)]">
        Онлайн-оплата не подключена: заказ фиксируется, мы свяжемся с вами для подтверждения и оплаты при получении.
      </p>
    </div>
  );
}
