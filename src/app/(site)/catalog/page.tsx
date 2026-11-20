import Link from "next/link";
import { getCategories, getProducts } from "@/server/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";
import { cn } from "@/lib/cn";

export const metadata = { title: "Каталог" };
export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; min?: string; max?: string }>;
}) {
  const sp = await searchParams;
  const categorySlug = sp.category;
  const minKopecks = sp.min ? Number(sp.min) * 100 : undefined;
  const maxKopecks = sp.max ? Number(sp.max) * 100 : undefined;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug, minKopecks, maxKopecks }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Каталог</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/catalog"
          className={cn(
            "rounded-full border px-4 py-2 text-sm transition",
            !categorySlug ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-accent)]",
          )}
        >
          Все разделы
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/catalog?category=${c.slug}`}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition",
              categorySlug === c.slug ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-accent)]",
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <form className="mt-4 flex flex-wrap items-end gap-3 text-sm text-[var(--color-muted)]" method="get">
        {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
        <label className="flex flex-col gap-1">
          Цена от
          <input name="min" type="number" defaultValue={sp.min} className="w-28 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)]" />
        </label>
        <label className="flex flex-col gap-1">
          до
          <input name="max" type="number" defaultValue={sp.max} className="w-28 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)]" />
        </label>
        <button className="rounded-full border border-[var(--color-line)] px-4 py-2 hover:border-[var(--color-accent)]">Применить</button>
      </form>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-[var(--color-muted)]">
          В этом разделе пока нет позиций на сайте — но они почти наверняка есть в магазине. Позвоните: {" "}
          <a href="tel:+79502506230" className="text-[var(--color-accent)]">+7 (950) 250-62-30</a>.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
