import Link from "next/link";
import { formatRub } from "@/lib/money";
import type { Product } from "@/server/catalog";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-accent)]">
      <Link href={`/catalog/${product.slug}`} className="flex-1">
        <div className="mb-3 flex items-center justify-between text-xs text-[var(--color-muted)]">
          <span>{product.category_name ?? product.subcategory}</span>
          {!product.is_available && <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5">нет в наличии</span>}
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
          {product.name}
        </h3>
        {product.subcategory && <p className="mt-1 text-sm text-[var(--color-muted)]">{product.subcategory}</p>}
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-display text-xl font-bold">{formatRub(product.price_kopecks)}</span>
        <AddToCartButton product={product} compact />
      </div>
      {product.price_source === "estimated_placeholder" && (
        <p className="mt-2 text-xs text-[var(--color-muted)]">цена ориентировочная, уточняется на месте</p>
      )}
    </div>
  );
}
