"use client";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Minus, Plus, X, ShoppingCart, Store } from "lucide-react";
import { useCart } from "./store";
import { formatRub } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * Корзина живёт выдвижной панелью справа, а не отдельным модальным окном:
 * покупатель добавляет вторую позицию, не теряя места в каталоге.
 * Страница /cart остаётся — её открывают по ссылке и из шапки на узких экранах.
 */
export function CartDrawer() {
  const { items, isOpen, closeCart, setQty, removeItem, totalKopecks, count, lastAddedId } = useCart();
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90]">
          <motion.div
            className="absolute inset-0 bg-ink/50 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Корзина"
            initial={reduced ? { opacity: 0 } : { x: "100%" }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-0 flex h-full w-full max-w-[26rem] flex-col border-l border-line bg-paper shadow-s3"
          >
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-2.5">
                <ShoppingCart size={18} className="text-accent" />
                <h2 className="font-display text-[17px] font-semibold">Корзина</h2>
                {count > 0 && <span className="tnum text-sm text-muted">· {count}</span>}
              </div>
              <button
                onClick={closeCart}
                aria-label="Закрыть корзину"
                className="grid size-9 place-items-center rounded-md text-muted transition-colors hover:bg-sunk hover:text-text"
              >
                <X size={18} />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <div className="grid size-14 place-items-center rounded-xl bg-sunk text-faint">
                  <ShoppingCart size={22} />
                </div>
                <p className="text-sm text-muted">
                  Пока пусто. В каталоге — то, что сейчас лежит на полке на Мира, 28.
                </p>
                <Button href="/catalog" variant="outline" size="sm" onClick={() => closeCart()}>
                  Открыть каталог
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-3 py-3">
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li
                        key={item.productId}
                        className={cn(
                          "rounded-md border bg-card p-3 transition-colors duration-[260ms]",
                          item.productId === lastAddedId ? "border-accent/60 bg-accent-soft/60" : "border-line",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            href={`/catalog/${item.slug}`}
                            onClick={closeCart}
                            className="text-[14px] font-medium leading-snug hover:text-accent-ink"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.productId)}
                            aria-label={`Убрать ${item.name}`}
                            className="shrink-0 text-faint transition-colors hover:text-bad"
                          >
                            <X size={15} />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-md border border-line bg-paper">
                            <button
                              onClick={() => setQty(item.productId, item.qty - 1)}
                              aria-label="Меньше"
                              className="grid size-8 place-items-center text-muted transition-colors hover:text-text"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="tnum w-7 text-center text-[13px] font-medium">{item.qty}</span>
                            <button
                              onClick={() => setQty(item.productId, item.qty + 1)}
                              aria-label="Больше"
                              className="grid size-8 place-items-center text-muted transition-colors hover:text-text"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <span className="tnum font-display text-[15px] font-semibold">
                            {formatRub(item.priceKopecks * item.qty)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <footer className="border-t border-line bg-card px-5 py-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted">Итого</span>
                    <span className="tnum font-display text-xl font-semibold">{formatRub(totalKopecks)}</span>
                  </div>
                  <Button href="/checkout" className="mt-3 w-full" onClick={() => closeCart()}>
                    Оформить заказ
                  </Button>
                  <p className="mt-3 flex items-start gap-2 text-[11.5px] leading-relaxed text-muted">
                    <Store size={14} className="mt-px shrink-0 text-faint" />
                    Оплата на сайте не проходит. Мы откладываем заказ и звоним с {site.phone}, чтобы
                    подтвердить наличие — платите в магазине.
                  </p>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
