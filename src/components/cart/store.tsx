"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  priceKopecks: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  count: number;
  totalKopecks: number;
  /** Состояние выдвижной корзины живёт здесь же: иначе шапка и кнопки
   *  «в корзину» на разных страницах не смогли бы открыть одну панель. */
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  /** id последнего добавленного товара — для подсветки строки в панели. */
  lastAddedId: string | null;
}

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = "tehnik_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // приватный режим / квота — корзина просто начнётся пустой
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setLastAddedId(item.productId);
    setIsOpen(true);
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) => (i.productId === item.productId ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) => (i.productId === productId ? { ...i, qty } : i));
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const totalKopecks = useMemo(() => items.reduce((sum, i) => sum + i.qty * i.priceKopecks, 0), [items]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  // Пока панель открыта, страница под ней не должна прокручиваться.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const value = useMemo(
    () => ({
      items, addItem, setQty, removeItem, clear, count, totalKopecks,
      isOpen, openCart, closeCart, lastAddedId,
    }),
    [items, addItem, setQty, removeItem, clear, count, totalKopecks, isOpen, openCart, closeCart, lastAddedId],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart должен использоваться внутри <CartProvider>");
  return ctx;
}
