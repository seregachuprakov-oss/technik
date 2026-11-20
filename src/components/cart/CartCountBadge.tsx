"use client";
import { useCart } from "./store";

export function CartCountBadge() {
  const { count } = useCart();
  if (count === 0) return null;
  return (
    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-xs font-semibold text-black">
      {count}
    </span>
  );
}
