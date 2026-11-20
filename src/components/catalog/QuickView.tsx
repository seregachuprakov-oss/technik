"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Eye, X } from "lucide-react";
import type { Product } from "@/server/catalog";
import { formatRub } from "@/lib/money";
import { AddToCartButton } from "./AddToCartButton";
import { ProductImage } from "./ProductImage";
import { StockDot } from "@/components/ui/Badge";

/**
 * Быстрый просмотр: характеристики и цена без ухода из каталога.
 * Открывается кнопкой-«глазом» на карточке, закрывается по Esc, по фону
 * и крестиком. Полная карточка остаётся отдельной страницей — быстрый
 * просмотр её не заменяет, поэтому внизу всегда ссылка на страницу товара.
 */
export function QuickViewTrigger({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const specs = Object.entries(product.specs ?? {}).slice(0, 6);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-card/92 px-2.5 py-1.5 text-[12px] font-medium text-text shadow-s1 backdrop-blur-[2px] transition-colors hover:border-accent hover:text-accent-ink"
      >
        <Eye size={14} /> Быстрый просмотр
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
            <motion.div
              className="absolute inset-0 bg-ink/55 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={product.name}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.985 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-3xl overflow-hidden rounded-t-xl border border-line bg-card shadow-s3 sm:rounded-xl"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Закрыть"
                className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-md bg-card/85 text-muted transition-colors hover:bg-sunk hover:text-text"
              >
                <X size={18} />
              </button>

              <div className="grid gap-0 sm:grid-cols-2">
                <ProductImage
                  product={product}
                  sizes="(max-width: 640px) 100vw, 380px"
                  className="aspect-4/3 w-full rounded-none sm:aspect-square"
                  rounded="rounded-none"
                />

                <div className="flex flex-col p-5 sm:p-7">
                  <span className="text-[11px] uppercase tracking-[0.08em] text-faint">
                    {product.subcategory ?? product.category_name}
                  </span>
                  <h2 className="mt-1.5 font-display text-xl font-semibold leading-tight">{product.name}</h2>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                    <StockDot ok={product.is_available} />
                    {product.is_available ? `В наличии: ${product.stock_qty} ${product.unit}` : "Под заказ"}
                  </div>

                  {specs.length > 0 && (
                    <dl className="mt-4 space-y-1.5 text-[13px]">
                      {specs.map(([k, v]) => (
                        <div key={k} className="flex gap-3 border-b border-line/70 pb-1.5">
                          <dt className="w-1/2 shrink-0 text-muted">{k}</dt>
                          <dd className="font-medium">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {specs.length === 0 && product.description && (
                    <p className="mt-4 line-clamp-5 text-[13px] leading-relaxed text-muted">{product.description}</p>
                  )}

                  <div className="mt-auto pt-6">
                    <div className="tnum font-display text-2xl font-semibold">{formatRub(product.price_kopecks)}</div>
                    {product.price_source === "estimated_placeholder" && (
                      <p className="mt-1 text-xs text-muted">Цена ориентировочная — точную назовут в магазине.</p>
                    )}
                    <div className="mt-4 flex items-center gap-3">
                      <AddToCartButton product={product} className="flex-1" />
                      <Link
                        href={`/catalog/${product.slug}`}
                        className="text-[13px] text-accent-ink underline-offset-4 hover:underline"
                      >
                        Вся карточка
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
