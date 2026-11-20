import { Suspense } from "react";
import Link from "next/link";
import { Phone, SlidersHorizontal } from "lucide-react";
import { getCategories, getProducts, type Product } from "@/server/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

export const metadata = { title: "Каталог" };
export const dynamic = "force-dynamic";

type SP = { category?: string; min?: string; max?: string; stock?: string; sort?: string };

const SORTS = [
  { key: "default", label: "Сначала в наличии" },
  { key: "price_asc", label: "Сначала дешевле" },
  { key: "price_desc", label: "Сначала дороже" },
  { key: "name", label: "По названию" },
] as const;

function sortProducts(products: Product[], sort?: string): Product[] {
  const copy = [...products];
  if (sort === "price_asc") return copy.sort((a, b) => a.price_kopecks - b.price_kopecks);
  if (sort === "price_desc") return copy.sort((a, b) => b.price_kopecks - a.price_kopecks);
  if (sort === "name") return copy.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  return copy; // порядок из БД: сначала то, что есть на полке
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const categories = await getCategories();
  const active = categories.find((c) => c.slug === sp.category);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <nav className="text-[12.5px] text-muted">
        <Link href="/" className="transition-colors hover:text-text">Главная</Link>
        <span className="px-1.5 text-faint">/</span>
        <span className="text-text">Каталог</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-tight">
            {active ? active.name : "Каталог"}
          </h1>
          <p className="mt-2 max-w-xl text-[14px] text-muted">
            {active?.description ??
              "То, что сейчас заведено на сайте. Остатки обновляются выгрузкой из 1С, по редким позициям проще позвонить."}
          </p>
        </div>
        <a
          href={`tel:${site.phoneHref}`}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-card px-3.5 py-2.5 text-[13px] font-medium transition-colors hover:border-accent hover:text-accent-ink"
        >
          <Phone size={14} /> Спросить наличие
        </a>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[232px_1fr]">
        <Filters sp={sp} categories={categories} />

        <Suspense key={JSON.stringify(sp)} fallback={<GridSkeleton />}>
          <ProductGrid sp={sp} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductGrid({ sp }: { sp: SP }) {
  const products = sortProducts(
    await getProducts({
      categorySlug: sp.category,
      minKopecks: sp.min ? Number(sp.min) * 100 : undefined,
      maxKopecks: sp.max ? Number(sp.max) * 100 : undefined,
      onlyAvailable: sp.stock === "1",
    }),
    sp.sort,
  );

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line-strong bg-card p-10 text-center">
        <p className="font-display text-[17px] font-semibold">Под этот фильтр на сайте ничего нет</p>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted">
          На полке в магазине позиция вполне может быть: на сайт заведено не всё. Позвоните{" "}
          <a href={`tel:${site.phoneHref}`} className="text-accent-ink underline-offset-4 hover:underline">
            {site.phone}
          </a>{" "}
          — посмотрим и отложим.
        </p>
        <Link
          href="/catalog"
          className="mt-5 inline-flex rounded-md border border-line px-4 py-2.5 text-[13px] transition-colors hover:border-accent hover:text-accent-ink"
        >
          Сбросить фильтры
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-[12.5px] text-muted">
        Позиций: <span className="tnum font-medium text-text">{products.length}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 3} />
        ))}
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

function Filters({ sp, categories }: { sp: SP; categories: { id: string; slug: string; name: string }[] }) {
  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <form method="get" className="space-y-6 rounded-lg border border-line bg-card p-5">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-faint">
          <SlidersHorizontal size={13} /> Фильтр
        </div>

        <fieldset>
          <legend className="mb-2.5 text-[13px] font-medium">Раздел</legend>
          <div className="space-y-1">
            <FilterLink href="/catalog" active={!sp.category} label="Все разделы" />
            {categories.map((c) => (
              <FilterLink
                key={c.id}
                href={`/catalog?category=${c.slug}`}
                active={sp.category === c.slug}
                label={c.name}
              />
            ))}
          </div>
        </fieldset>

        <div className="h-px bg-line" />

        {sp.category && <input type="hidden" name="category" value={sp.category} />}

        <fieldset>
          <legend className="mb-2.5 text-[13px] font-medium">Цена, ₽</legend>
          <div className="flex items-center gap-2">
            <input
              name="min"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="от"
              defaultValue={sp.min}
              className="tnum w-full rounded-md border border-line bg-paper px-2.5 py-2 text-[13px] outline-none transition-colors focus:border-accent"
            />
            <span className="text-faint">—</span>
            <input
              name="max"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="до"
              defaultValue={sp.max}
              className="tnum w-full rounded-md border border-line bg-paper px-2.5 py-2 text-[13px] outline-none transition-colors focus:border-accent"
            />
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-center gap-2.5 text-[13px]">
          <input
            type="checkbox"
            name="stock"
            value="1"
            defaultChecked={sp.stock === "1"}
            className="size-4 accent-[var(--color-accent)]"
          />
          Только то, что на полке
        </label>

        <div>
          <label className="mb-2 block text-[13px] font-medium" htmlFor="sort">Сортировка</label>
          <select
            id="sort"
            name="sort"
            defaultValue={sp.sort ?? "default"}
            className="w-full rounded-md border border-line bg-paper px-2.5 py-2 text-[13px] outline-none transition-colors focus:border-accent"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button className="h-10 flex-1 rounded-md bg-ink text-[13px] font-medium text-white transition-colors hover:bg-ink-3">
            Показать
          </button>
          <Link
            href={sp.category ? `/catalog?category=${sp.category}` : "/catalog"}
            className="grid h-10 place-items-center rounded-md border border-line px-3 text-[13px] text-muted transition-colors hover:text-text"
          >
            Сброс
          </Link>
        </div>
      </form>
    </aside>
  );
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-sm px-2 py-1.5 text-[13.5px] transition-colors duration-[120ms]",
        active ? "bg-accent-soft font-medium text-accent-ink" : "text-muted hover:bg-sunk hover:text-text",
      )}
    >
      <span className={cn("size-1.5 rounded-full", active ? "bg-accent" : "bg-line-strong")} />
      {label}
    </Link>
  );
}
