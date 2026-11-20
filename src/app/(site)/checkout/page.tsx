import Link from "next/link";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata = { title: "Оформление заказа" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
      <nav className="text-[12.5px] text-muted">
        <Link href="/cart" className="transition-colors hover:text-text">Корзина</Link>
        <span className="px-1.5 text-faint">/</span>
        <span className="text-text">Оформление</span>
      </nav>

      <h1 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-semibold">Оформление заказа</h1>
      <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted">
        Это бронь, а не покупка. Менеджер проверит позиции на полке, подтвердит цену по
        телефону и отложит заказ — платите в магазине на кассе.
      </p>

      <CheckoutClient />
    </div>
  );
}
