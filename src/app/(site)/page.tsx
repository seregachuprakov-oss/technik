import Link from "next/link";
import { ArrowRight, MapPin, Clock, Star, Wrench, Zap, Bolt } from "lucide-react";
import { site } from "@/config/site";
import { getCategories, getFeaturedProducts } from "@/server/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Button } from "@/components/ui/Button";

const CATEGORY_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "power-tools": Zap,
  "hand-tools": Wrench,
  fasteners: Bolt,
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts(4)]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div className="absolute inset-0 grain opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">
              просп. Мира, 28 · Котлас
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl">
              Инструмент, который есть на полке, а не только на сайте
            </h1>
            <p className="mt-6 text-lg text-[var(--color-muted)]">
              «Техник» работает в Котласе с крепежа и ручного инструмента до бензопил и генераторов.
              Зайдите, потрогайте, возьмите с собой — или оставьте заявку здесь, мы подготовим заказ к вашему приходу.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/catalog">
                Смотреть каталог <ArrowRight size={16} />
              </Button>
              <Button href="/rental" variant="outline">Прокат инструмента</Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-[var(--color-muted)]">
              <span className="flex items-center gap-1.5">
                <Star size={16} className="text-[var(--color-accent-2)]" fill="currentColor" />
                {site.rating} на Яндекс Картах · {site.reviewsCount} отзывов
              </span>
              <span className="flex items-center gap-1.5"><Clock size={16} /> {site.hours}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-bold">Разделы магазина</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {categories.map((c) => {
              const Icon = CATEGORY_ICON[c.slug] ?? Wrench;
              return (
                <Link
                  key={c.id}
                  href={`/catalog?category=${c.slug}`}
                  className="group rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink)] p-6 transition hover:border-[var(--color-accent)]"
                >
                  <Icon size={28} className="text-[var(--color-accent)]" />
                  <h3 className="mt-4 font-display text-lg font-semibold group-hover:text-[var(--color-accent)]">{c.name}</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">{c.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold">Из наличия сейчас</h2>
            <Link href="/catalog" className="text-sm text-[var(--color-accent)] hover:underline">весь каталог →</Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section id="about" className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold">Как нас найти</h2>
            <div className="mt-6 space-y-4 text-[var(--color-muted)]">
              <p className="flex items-start gap-3"><MapPin size={20} className="mt-0.5 shrink-0 text-[var(--color-accent)]" /> {site.address}</p>
              <p className="flex items-start gap-3"><Clock size={20} className="mt-0.5 shrink-0 text-[var(--color-accent)]" /> {site.hours}</p>
              <p className="flex items-start gap-3"><Star size={20} className="mt-0.5 shrink-0 text-[var(--color-accent)]" /> {site.rating} из 5 на Яндекс Картах, {site.reviewsCount} отзывов</p>
            </div>
            <a
              href={`https://yandex.ru/maps/?text=${encodeURIComponent(site.mapQuery)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block text-sm text-[var(--color-accent)] hover:underline"
            >
              Открыть на Яндекс Картах →
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[var(--color-line)]">
            <iframe
              title="Карта: Техник, просп. Мира 28, Котлас"
              src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(site.mapQuery)}&z=16`}
              className="h-full min-h-72 w-full"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
