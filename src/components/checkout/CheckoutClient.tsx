"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, Truck, AlertCircle, Loader2 } from "lucide-react";
import { useCart } from "@/components/cart/store";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatRub } from "@/lib/money";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { submitOrder } from "@/app/(site)/checkout/actions";

export function CheckoutClient() {
  const { items, totalKopecks, clear } = useCart();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-dashed border-line-strong bg-card p-10 text-center">
        <p className="font-display text-[16px] font-semibold">Корзина пуста</p>
        <p className="mt-2 text-[14px] text-muted">Оформлять нечего — сначала выберите позиции в каталоге.</p>
        <Link
          href="/catalog"
          className="mt-5 inline-flex rounded-md border border-line px-4 py-2.5 text-[13px] transition-colors hover:border-accent hover:text-accent-ink"
        >
          В каталог
        </Link>
      </div>
    );
  }

  return (
    <form
      className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const form = new FormData(e.currentTarget);
        const result = await submitOrder({
          name: form.get("name"),
          phone: form.get("phone"),
          fulfillment,
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
      <div className="space-y-6">
        <section className="rounded-lg border border-line bg-card p-5">
          <h2 className="font-display text-[15px] font-semibold">Как забираете</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ChoiceCard
              active={fulfillment === "pickup"}
              onClick={() => setFulfillment("pickup")}
              icon={<Store size={17} />}
              title="Самовывоз"
              note={site.address}
            />
            <ChoiceCard
              active={fulfillment === "delivery"}
              onClick={() => setFulfillment("delivery")}
              icon={<Truck size={17} />}
              title="Доставка по Котласу"
              note="Условия и стоимость — по телефону"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-line bg-card p-5">
          <h2 className="font-display text-[15px] font-semibold">Контакты</h2>
          <Field label="Имя" htmlFor="co-name">
            <Input id="co-name" name="name" placeholder="Как к вам обращаться" required autoComplete="name" />
          </Field>
          <Field
            label="Телефон"
            htmlFor="co-phone"
            hint="Позвоним на него, чтобы подтвердить наличие и сумму. Больше никуда номер не уходит."
          >
            <Input
              id="co-phone"
              name="phone"
              type="tel"
              placeholder="+7 ..."
              required
              autoComplete="tel"
              inputMode="tel"
            />
          </Field>

          {fulfillment === "delivery" && (
            <Field label="Адрес доставки" htmlFor="co-address">
              <Input id="co-address" name="address" placeholder="Улица, дом, квартира" autoComplete="street-address" />
            </Field>
          )}

          <Field label="Комментарий" htmlFor="co-comment" hint="Например: нужен другой размер скобы или другая мощность.">
            <Textarea id="co-comment" name="comment" rows={3} placeholder="Необязательно" />
          </Field>
        </section>
      </div>

      <aside className="space-y-4 rounded-lg border border-line bg-card p-5 lg:sticky lg:top-28">
        <h2 className="font-display text-[15px] font-semibold">Заказ</h2>
        <ul className="space-y-2 text-[13px]">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3 text-muted">
              <span className="leading-snug">
                {i.name} <span className="tnum text-faint">× {i.qty}</span>
              </span>
              <span className="tnum shrink-0 font-medium text-text">{formatRub(i.priceKopecks * i.qty)}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <span className="text-[14px] text-muted">Итого</span>
          <span className="tnum font-display text-xl font-semibold">{formatRub(totalKopecks)}</span>
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-md bg-bad-soft px-3 py-2.5 text-[13px] text-bad">
            <AlertCircle size={15} className="mt-px shrink-0" />
            {error}
          </p>
        )}

        <Button type="submit" disabled={pending} size="lg" className="w-full">
          {pending ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Отправляем
            </>
          ) : (
            "Подтвердить заказ"
          )}
        </Button>

        <p className="text-[12px] leading-relaxed text-muted">
          Нажимая кнопку, вы оставляете заявку на покупку. Деньги не списываются: сумму
          назовёт менеджер по телефону, оплата в магазине.
        </p>
      </aside>
    </form>
  );
}

function ChoiceCard({
  active,
  onClick,
  icon,
  title,
  note,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  note: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md border p-4 text-left transition-[border-color,background-color,box-shadow] duration-[180ms]",
        active ? "border-accent bg-accent-soft shadow-s1" : "border-line hover:border-line-strong",
      )}
    >
      <span className={cn("inline-flex items-center gap-2 text-[14px] font-medium", active && "text-accent-ink")}>
        {icon} {title}
      </span>
      <span className="mt-1.5 block text-[12.5px] leading-snug text-muted">{note}</span>
    </button>
  );
}
