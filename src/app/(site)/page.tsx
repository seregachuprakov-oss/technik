import Link from "next/link";
import {
  ArrowRight, MapPin, Clock, Star, Wrench, Zap, Bolt, Phone, PackageCheck, Timer, ClipboardList,
} from "lucide-react";
import { site } from "@/config/site";
import { getCategories, getFeaturedProducts } from "@/server/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

const CATEGORY_ICON: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  "power-tools": Zap,
  "hand-tools": Wrench,
  fasteners: Bolt,
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts(8)]);

  return (
    <div>
      {/* ---------------- Герой ---------------- */}
      <section className="on-dark relative overflow-hidden">
        <div className="blueprint absolute inset-0" aria-hidden />
        <div
          aria-hidden
          className="absolute -right-40 -top-40 size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(232,116,12,.18),transparent_62%)]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:py-24 lg:grid-cols-[1.35fr_1fr] lg:items-center">
          <div className="tk-rise">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent" />
              <span className="text-[11.5px] font-medium uppercase tracking-[0.16em] text-accent-ink">
                Котлас · просп. Мира, 28
              </span>
            </div>

            <h1 className="mt-5 font-display text-[clamp(2.1rem,5.4vw,3.6rem)] font-semibold leading-[1.04]">
              Инструмент, который лежит на полке,
              <span className="text-accent"> а не едет неделю</span>
            </h1>

            <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-muted">
              Смотрите на сайте, что есть сейчас, откладывайте по кнопке — и забирайте
              в этот же день на Мира, 28. Крепёж, ручной инструмент, электро- и бензотехника.
              Непонятно, какой размер или мощность нужны — звоните, подберём по телефону.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/catalog" size="lg">
                Смотреть каталог <ArrowRight size={16} />
              </Button>
              <Button href={`tel:${site.phoneHref}`} size="lg" variant="outline">
                <Phone size={15} /> {site.phone}
              </Button>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
              <Stat value={String(site.rating)} label="на Яндекс Картах" />
              <Stat value={String(site.reviewsCount)} label="отзывов" />
              <Stat value="с 2010" label="работаем в Котласе" />
            </dl>
          </div>

          {/* Паспорт магазина: то, что в офлайне спрашивают по телефону первым. */}
          <div className="tk-rise rounded-xl border border-line bg-card/70 p-6 backdrop-blur-sm [animation-delay:120ms]">
            <div className="text-[11px] uppercase tracking-[0.12em] text-faint">Магазин сегодня</div>
            <ul className="mt-5 space-y-4 text-[14px]">
              <Row icon={<MapPin size={16} />} title={site.address} note="Вход со стороны проспекта" />
              <Row icon={<Clock size={16} />} title={site.hours} note="Воскресенье — короткий день" />
              <Row icon={<PackageCheck size={16} />} title="Самовывоз в день заказа" note="Отложим позицию до закрытия" />
              <Row icon={<Star size={16} />} title={`${site.rating} из 5 · ${site.reviewsCount} отзывов`} note="Яндекс Карты" />
            </ul>
            <a
              href={`https://yandex.ru/maps/?text=${encodeURIComponent(site.mapQuery)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-accent-ink underline-offset-4 hover:underline"
            >
              Открыть на картах <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- Разделы ---------------- */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <Reveal>
          <SectionHead
            eyebrow="Разделы"
            title="Три полки, из которых состоит магазин"
            right={
              <Link href="/catalog" className="text-[13.5px] text-accent-ink underline-offset-4 hover:underline">
                Весь каталог →
              </Link>
            }
          />
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {categories.map((c, i) => {
            const Icon = CATEGORY_ICON[c.slug] ?? Wrench;
            return (
              <Reveal key={c.id} delay={i * 0.06}>
                <Link
                  href={`/catalog?category=${c.slug}`}
                  className="group flex h-full flex-col rounded-lg border border-line bg-card p-6 shadow-s1 transition-[transform,box-shadow,border-color] duration-[260ms] ease-[var(--ease-out-quint)] hover:-translate-y-0.5 hover:border-line-strong hover:shadow-s2"
                >
                  <span className="grid size-11 place-items-center rounded-md bg-accent-soft text-accent-ink transition-colors duration-[180ms] group-hover:bg-accent group-hover:text-white">
                    <Icon size={20} strokeWidth={1.9} />
                  </span>
                  <h3 className="mt-5 font-display text-[17px] font-semibold">{c.name}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{c.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-ink">
                    Перейти
                    <ArrowRight size={14} className="transition-transform duration-[260ms] ease-[var(--ease-snap)] group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------------- Каталог ---------------- */}
      {featured.length > 0 && (
        <section className="border-y border-line bg-card/60">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <Reveal>
              <SectionHead
                eyebrow="Каталог"
                title="Из наличия сейчас"
                right={
                  <Link href="/catalog" className="text-[13.5px] text-accent-ink underline-offset-4 hover:underline">
                    Ещё позиции →
                  </Link>
                }
              />
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i, 3) * 0.05}>
                  <ProductCard product={p} priority={i < 4} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- Как это работает ---------------- */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <Reveal>
          <SectionHead eyebrow="Как это работает" title="Заказ на сайте — это бронь, а не оплата" />
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ClipboardList,
              title: "Вы оставляете заказ",
              text: "Складываете позиции в корзину и указываете телефон. Регистрация не нужна.",
            },
            {
              icon: Phone,
              title: "Мы звоним и проверяем полку",
              text: `Сверяем остаток руками и подтверждаем цену. Если позиции нет — скажем честно и предложим замену.`,
            },
            {
              icon: Timer,
              title: "Забираете на Мира, 28",
              text: "Отложенный заказ ждёт до конца рабочего дня. Платите на кассе — картой или наличными.",
            },
          ].map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <div className="flex h-full flex-col rounded-lg border border-line bg-card p-6">
                <div className="flex items-center gap-3">
                  <span className="tnum font-display text-[13px] font-semibold text-accent">0{i + 1}</span>
                  <span className="h-px flex-1 bg-line" />
                  <s.icon size={17} className="text-faint" />
                </div>
                <h3 className="mt-4 font-display text-[16px] font-semibold">{s.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Магазин и карта ---------------- */}
      <section id="shop" className="on-dark scroll-mt-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-20 md:grid-cols-2 md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent" />
              <span className="text-[11.5px] font-medium uppercase tracking-[0.16em] text-accent-ink">Как нас найти</span>
            </div>
            <h2 className="mt-5 font-display text-[clamp(1.6rem,3.4vw,2.3rem)] font-semibold leading-tight">
              Просп. Мира, 28 — первый этаж
            </h2>
            <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-muted">
              Если едете за конкретной позицией — позвоните заранее, отложим. Так никто не уезжает зря.
            </p>

            <div className="mt-7 space-y-3 text-[14px]">
              <p className="flex items-center gap-3">
                <Clock size={16} className="shrink-0 text-accent" /> {site.hours}
              </p>
              <a href={`tel:${site.phoneHref}`} className="flex items-center gap-3 transition-colors hover:text-accent-ink">
                <Phone size={16} className="shrink-0 text-accent" /> {site.phone}
              </a>
              <p className="flex items-center gap-3">
                <Star size={16} className="shrink-0 text-accent" /> {site.rating} из 5 на Яндекс Картах, {site.reviewsCount} отзывов
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/catalog">Открыть каталог</Button>
              <Button href="/rental" variant="outline">Нужен на один раз — прокат</Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-line">
            <iframe
              title="Карта: Техник, просп. Мира 28, Котлас"
              src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(site.mapQuery)}&z=16`}
              className="h-full min-h-80 w-full"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-paper px-4 py-4">
      <dt className="tnum font-display text-xl font-semibold">{value}</dt>
      <dd className="mt-0.5 text-[12px] leading-snug text-muted">{label}</dd>
    </div>
  );
}

function Row({ icon, title, note }: { icon: React.ReactNode; title: string; note: string }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 shrink-0 text-accent">{icon}</span>
      <span>
        <span className="block font-medium">{title}</span>
        <span className="block text-[12.5px] text-faint">{note}</span>
      </span>
    </li>
  );
}

function SectionHead({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-accent" />
          <span className="text-[11.5px] font-medium uppercase tracking-[0.16em] text-accent-ink">{eyebrow}</span>
        </div>
        <h2 className="mt-3 font-display text-[clamp(1.5rem,3.2vw,2.1rem)] font-semibold leading-tight">{title}</h2>
      </div>
      {right}
    </div>
  );
}
