import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/server/catalog";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { formatRub } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const specs = Object.entries(product.specs ?? {});

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <nav className="mb-6 text-sm text-[var(--color-muted)]">
        <Link href="/catalog" className="hover:text-[var(--color-text)]">Каталог</Link>
        {product.category_name && <> / <Link href={`/catalog?category=${product.category_slug}`} className="hover:text-[var(--color-text)]">{product.category_name}</Link></>}
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-muted)]">
          фото уточняется
        </div>

        <div>
          {product.subcategory && <p className="text-sm uppercase tracking-wide text-[var(--color-muted)]">{product.subcategory}</p>}
          <h1 className="mt-2 font-display text-3xl font-bold">{product.name}</h1>
          <p className="mt-4 font-display text-3xl font-extrabold text-[var(--color-accent)]">{formatRub(product.price_kopecks)}</p>
          {product.price_source === "estimated_placeholder" && (
            <p className="mt-1 text-sm text-[var(--color-muted)]">ориентировочная цена, уточняйте в магазине</p>
          )}

          <div className="mt-6">
            <AddToCartButton product={product} />
          </div>

          {!product.is_available && (
            <p className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-muted)]">
              Сейчас нет в наличии — позвоните, уточним срок поступления: <a href="tel:+79502506230" className="text-[var(--color-accent)]">+7 (950) 250-62-30</a>
            </p>
          )}

          <p className="mt-8 text-[var(--color-muted)]">{product.description}</p>

          {product.article && (
            <p className="mt-4 text-xs text-[var(--color-muted)]">Артикул: {product.article}{product.barcode ? ` · Штрихкод: ${product.barcode}` : ""}</p>
          )}

          {specs.length > 0 && (
            <dl className="mt-8 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)] text-sm">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between py-2">
                  <dt className="text-[var(--color-muted)]">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
