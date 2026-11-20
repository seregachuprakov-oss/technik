import Link from "next/link";
import { formatRub } from "@/lib/money";
import type { Product } from "@/server/catalog";
import { AddToCartButton } from "./AddToCartButton";
import { ProductImage } from "./ProductImage";
import { QuickViewTrigger } from "./QuickView";
import { StockDot } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { isDemoProduct } from "@/lib/product";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-lg border border-line bg-card p-3",
        "shadow-s1 transition-[transform,box-shadow,border-color] duration-[260ms] ease-[var(--ease-out-quint)]",
        "hover:-translate-y-0.5 hover:border-line-strong hover:shadow-s2",
      )}
    >
      <div className="relative">
        <ProductImage
          product={product}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 300px"
          priority={priority}
          className="aspect-4/3 w-full"
        />
        <div className="pointer-events-none absolute right-2 top-2 z-[2] opacity-0 transition-opacity duration-[180ms] group-hover:pointer-events-auto group-hover:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100">
          <QuickViewTrigger product={product} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3.5">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.06em] text-faint">
          <span className="truncate">{product.subcategory ?? product.category_name ?? "Инструмент"}</span>
          {isDemoProduct(product) && (
            <span className="ml-auto shrink-0 rounded-xs bg-sunk px-1.5 py-0.5 text-[10px] text-muted" title="Карточка-пример, пока магазин не выгрузил каталог из 1С">
              демо
            </span>
          )}
        </div>

        <h3 className="mt-1.5 text-[15px] font-medium leading-snug">
          <Link href={`/catalog/${product.slug}`} className="transition-colors duration-[120ms] after:absolute after:inset-0 hover:text-accent-ink">
            {product.name}
          </Link>
        </h3>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
          <StockDot ok={product.is_available} />
          {product.is_available
            ? product.stock_qty > 0
              ? `В наличии: ${product.stock_qty} ${product.unit}`
              : "В наличии"
            : "Под заказ, уточняйте"}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <div className="tnum font-display text-[21px] font-semibold leading-none">{formatRub(product.price_kopecks)}</div>
            {product.price_source === "estimated_placeholder" && (
              <div className="mt-1 text-[11px] text-muted">цена ориентировочная</div>
            )}
          </div>
          <div className="relative z-[1]">
            <AddToCartButton product={product} compact />
          </div>
        </div>
      </div>
    </article>
  );
}
