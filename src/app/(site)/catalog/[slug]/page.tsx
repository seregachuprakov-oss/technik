import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Store, Clock, ShieldCheck } from "lucide-react";
import { getProductBySlug, getProducts } from "@/server/catalog";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { ProductImage } from "@/components/catalog/ProductImage";
import { ProductCard } from "@/components/catalog/ProductCard";
import { StockDot } from "@/components/ui/Badge";
import { formatRub } from "@/lib/money";
import { isDemoProduct } from "@/lib/product";
import { site } from "@/config/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Товар не найден" };
  return {
    title: product.name,
    description: product.description?.slice(0, 160) || `${product.name} — магазин «Техник», ${site.address}.`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const specs = Object.entries(product.specs ?? {});
  const related = (await getProducts({ categorySlug: product.category_slug }))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
      <nav className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted">
        <Link href="/catalog" className="inline-flex items-center gap-1.5 transition-colors hover:text-text">
          <ArrowLeft size={13} /> Каталог
        </Link>
        {product.category_name && (
          <>
            <span className="text-faint">/</span>
            <Link href={`/catalog?category=${product.category_slug}`} className="transition-colors hover:text-text">
              {product.category_name}
            </Link>
          </>
        )}
        {product.subcategory && (
          <>
            <span className="text-faint">/</span>
            <span className="text-text">{product.subcategory}</span>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ProductImage
            product={product}
            sizes="(max-width: 1024px) 100vw, 620px"
            priority
            className="aspect-4/3 w-full rounded-lg border border-line"
          />
        </div>

        <div>
          {isDemoProduct(product) && (
            <p className="mb-4 rounded-md border border-line bg-sunk px-3.5 py-2.5 text-[12.5px] leading-relaxed text-muted">
              Карточка-пример: заведена для наполнения каталога, пока магазин не выгрузил номенклатуру из 1С.
              Цена и наличие этой позиции не подтверждены.
            </p>
          )}

          <h1 className="font-display text-[clamp(1.5rem,3.4vw,2.1rem)] font-semibold leading-tight">{product.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted">
            <span className="flex items-center gap-1.5">
              <StockDot ok={product.is_available} />
              {product.is_available
                ? `На полке: ${product.stock_qty} ${product.unit}`
                : "Сейчас нет на полке"}
            </span>
            {product.article && <span className="tnum">Артикул {product.article}</span>}
            {product.barcode && <span className="tnum hidden sm:inline">Штрихкод {product.barcode}</span>}
          </div>

          <div className="mt-6 rounded-lg border border-line bg-card p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="tnum font-display text-[32px] font-semibold leading-none">
                  {formatRub(product.price_kopecks)}
                </div>
                <div className="mt-1.5 text-[12.5px] text-muted">
                  {product.price_source === "estimated_placeholder"
                    ? "Цена ориентировочная — точную назовут на кассе"
                    : `Цена за 1 ${product.unit}`}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <AddToCartButton product={product} className="min-w-44 flex-1" />
              <a
                href={`tel:${site.phoneHref}`}
                className="inline-flex h-12 items-center gap-2 rounded-md border border-line px-4 text-[13.5px] font-medium transition-colors hover:border-accent hover:text-accent-ink"
              >
                <Phone size={15} /> Позвонить
              </a>
            </div>

            <ul className="mt-5 space-y-2.5 border-t border-line pt-4 text-[13px] text-muted">
              <li className="flex items-start gap-2.5">
                <Store size={15} className="mt-px shrink-0 text-accent" />
                Самовывоз: {site.address}. Отложим до конца рабочего дня.
              </li>
              <li className="flex items-start gap-2.5">
                <Clock size={15} className="mt-px shrink-0 text-accent" />
                {site.hours}
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck size={15} className="mt-px shrink-0 text-accent" />
                Оплата на кассе при получении: онлайн-оплата на сайте не подключена.
              </li>
            </ul>
          </div>

          {!product.is_available && (
            <p className="mt-4 rounded-md border border-warn/25 bg-warn-soft px-4 py-3 text-[13px] leading-relaxed text-warn">
              Этой позиции сейчас нет на полке. Позвоните{" "}
              <a href={`tel:${site.phoneHref}`} className="font-medium underline underline-offset-4">
                {site.phone}
              </a>{" "}
              — скажем, когда будет поставка, или подберём аналог из наличия.
            </p>
          )}

          {product.description && (
            <div className="mt-8">
              <h2 className="font-display text-[15px] font-semibold">Описание</h2>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">{product.description}</p>
            </div>
          )}

          {specs.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-[15px] font-semibold">Характеристики</h2>
              <dl className="mt-3 overflow-hidden rounded-md border border-line text-[13.5px]">
                {specs.map(([k, v], i) => (
                  <div key={k} className={`flex gap-4 px-4 py-2.5 ${i % 2 ? "bg-card" : "bg-sunk/60"}`}>
                    <dt className="w-1/2 shrink-0 text-muted">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="font-display text-[clamp(1.25rem,2.6vw,1.6rem)] font-semibold">
            Из того же раздела
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
