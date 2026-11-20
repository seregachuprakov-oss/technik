"use client";
import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { useCart } from "@/components/cart/store";
import { cn } from "@/lib/cn";
import type { Product } from "@/server/catalog";

export function AddToCartButton({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (!product.is_available) {
    return (
      <button disabled className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs text-[var(--color-muted)]">
        нет в наличии
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        addItem({ productId: product.id, slug: product.slug, name: product.name, priceKopecks: product.price_kopecks });
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
      }}
      className={cn(
        "flex items-center gap-1.5 rounded-full bg-[var(--color-accent)] text-black transition hover:brightness-110",
        compact ? "px-3 py-2 text-xs" : "px-5 py-3 text-sm font-medium",
      )}
    >
      {added ? <Check size={16} /> : <Plus size={16} />}
      {added ? "В корзине" : "В корзину"}
    </button>
  );
}
