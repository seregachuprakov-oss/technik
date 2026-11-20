"use client";
import { useState } from "react";
import { Plus, Check, ShoppingCart, Phone } from "lucide-react";
import { useCart } from "@/components/cart/store";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import type { Product } from "@/server/catalog";

/**
 * «Защёлка» — фирменное микродвижение магазина инструмента: кнопка на 260 мс
 * садится на 6% вниз по кривой snap и отпускается, иконка «+» сменяется
 * галочкой, по нижней кромке проходит янтарная риска. Ощущение — щелчок
 * фиксатора, а не «всплыла плашка». При prefers-reduced-motion остаётся
 * только смена иконки и подписи (CSS-правило в globals.css глушит анимации).
 */
export function AddToCartButton({
  product,
  compact = false,
  qty = 1,
  className,
}: {
  product: Product;
  compact?: boolean;
  qty?: number;
  className?: string;
}) {
  const { addItem } = useCart();
  const [latched, setLatched] = useState(0);

  // Позиции нет на полке — вместо мёртвой кнопки даём то, что реально
  // помогает: звонок в магазин, где остаток проверят руками.
  if (!product.is_available) {
    return (
      <a
        href={`tel:${site.phoneHref}`}
        title={`Нет на полке — позвоните, уточним срок: ${site.phone}`}
        className={cn(
          "relative z-[1] inline-flex items-center justify-center gap-2 rounded-md border border-line text-[13px] text-muted transition-colors duration-[180ms] hover:border-accent hover:text-accent-ink",
          compact ? "size-10" : "h-12 px-5",
          className,
        )}
      >
        <Phone size={15} />
        {!compact && "Уточнить наличие"}
      </a>
    );
  }

  const added = latched > 0;

  return (
    <button
      key={latched}
      onClick={() => {
        addItem(
          { productId: product.id, slug: product.slug, name: product.name, priceKopecks: product.price_kopecks },
          qty,
        );
        setLatched((n) => n + 1);
        setTimeout(() => setLatched(0), 1600);
      }}
      aria-label={compact ? `Добавить «${product.name}» в корзину` : undefined}
      className={cn(
        "group/add relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md font-medium text-white",
        "transition-colors duration-[180ms] ease-[var(--ease-snap)]",
        added ? "bg-ok" : "bg-accent hover:bg-accent-hover",
        added && "tk-latch",
        compact ? "size-10" : "h-12 px-6 text-sm",
        className,
      )}
    >
      {compact ? (
        added ? <Check size={17} strokeWidth={2.6} /> : <Plus size={17} strokeWidth={2.6} />
      ) : added ? (
        <>
          <Check size={17} strokeWidth={2.6} /> В корзине
        </>
      ) : (
        <>
          <ShoppingCart size={17} strokeWidth={2.2} /> В корзину
        </>
      )}
      {added && (
        <span aria-hidden className="tk-sweep absolute inset-x-0 bottom-0 h-[2px] bg-white/70" />
      )}
    </button>
  );
}
