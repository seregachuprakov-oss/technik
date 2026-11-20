"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/store";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatRub } from "@/lib/money";
import { submitOrder } from "@/app/(site)/checkout/actions";

export function CheckoutClient() {
  const { items, totalKopecks, clear } = useCart();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return <p className="mt-10 text-[var(--color-muted)]">Корзина пуста — вернитесь в каталог.</p>;
  }

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const form = new FormData(e.currentTarget);
        const result = await submitOrder({
          name: form.get("name"),
          phone: form.get("phone"),
          fulfillment: form.get("fulfillment"),
          address: form.get("address") || undefined,
          comment: form.get("comment") || undefined,
          lines: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        });
        setPending(false);
        if (!result.ok) {
          setError(result.error ?? "Не удалось оформить заказ");
          return;
        }
        clear();
        router.push(`/order/${result.publicToken}`);
      }}
    >
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        {items.map((i) => (
          <div key={i.productId} className="flex justify-between py-1 text-sm text-[var(--color-muted)]">
            <span>{i.name} × {i.qty}</span>
            <span>{formatRub(i.priceKopecks * i.qty)}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between border-t border-[var(--color-line)] pt-3 font-display text-lg font-bold">
          <span>Итого</span>
          <span>{formatRub(totalKopecks)}</span>
        </div>
      </div>

      <Input name="name" placeholder="Имя" required />
      <Input name="phone" placeholder="Телефон" required />
      <Select name="fulfillment" defaultValue="pickup">
        <option value="pickup">Самовывоз, просп. Мира, 28</option>
        <option value="delivery">Доставка по Котласу</option>
      </Select>
      <Input name="address" placeholder="Адрес доставки (если нужна доставка)" />
      <Textarea name="comment" placeholder="Комментарий к заказу" rows={3} />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Отправляем..." : "Подтвердить заказ"}
      </Button>
    </form>
  );
}
