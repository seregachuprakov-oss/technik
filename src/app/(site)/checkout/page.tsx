import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata = { title: "Оформление заказа" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Оформление заказа</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Эквайринг пока не подключён: мы свяжемся с вами для подтверждения и оплаты на месте. Заказ не является окончательным, пока менеджер не подтвердит его по телефону.
      </p>
      <CheckoutClient />
    </div>
  );
}
