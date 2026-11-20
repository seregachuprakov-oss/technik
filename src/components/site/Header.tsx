"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingCart, Phone, MapPin, Clock, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { site } from "@/config/site";
import { useCart } from "@/components/cart/store";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/catalog", label: "Каталог" },
  { href: "/rental", label: "Прокат" },
  { href: "/#shop", label: "Магазин" },
  { href: "/account", label: "Кабинет" },
];

export function Header() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenu(false), [pathname]);

  return (
    <header className="sticky top-0 z-50">
      {/* Служебная полоса: адрес и часы видны до того, как человек начал искать контакты. */}
      <div className="on-dark hidden border-b border-line/60 text-[12.5px] md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2 text-muted">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-accent" /> {site.address}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-accent" /> {site.hours}
            </span>
          </div>
          <a href={`tel:${site.phoneHref}`} className="font-medium text-text transition-colors hover:text-accent-ink">
            {site.phone}
          </a>
        </div>
      </div>

      <div
        className={cn(
          "border-b bg-paper/92 backdrop-blur-md transition-[box-shadow,border-color] duration-[260ms]",
          scrolled ? "border-line shadow-s1" : "border-transparent",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-5">
          <Link href="/" aria-label="На главную" className="shrink-0 text-text">
            <Logo className="h-7" />
          </Link>

          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = item.href === "/catalog" ? pathname.startsWith("/catalog") : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-sm px-3 py-2 text-[14px] transition-colors duration-[120ms]",
                    active ? "text-text" : "text-muted hover:text-text",
                  )}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent"
                      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <a
              href={`tel:${site.phoneHref}`}
              className="hidden items-center gap-2 rounded-md border border-line px-3 py-2 text-[13px] font-medium transition-colors hover:border-accent hover:text-accent-ink sm:flex md:hidden lg:flex"
            >
              <Phone size={14} /> {site.phone}
            </a>

            <button
              onClick={openCart}
              className="relative inline-flex items-center gap-2 rounded-md bg-ink px-3.5 py-2.5 text-[13px] font-medium text-white transition-[background-color,transform] duration-[180ms] ease-[var(--ease-snap)] hover:bg-ink-3 active:translate-y-px"
            >
              <ShoppingCart size={15} />
              <span className="hidden sm:inline">Корзина</span>
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.2, 0.9, 0.1, 1] }}
                    className="tnum absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              onClick={() => setMenu((v) => !v)}
              aria-label="Меню"
              aria-expanded={menu}
              className="grid size-10 place-items-center rounded-md border border-line text-text md:hidden"
            >
              {menu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {menu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-line md:hidden"
            >
              <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="border-b border-line/70 py-3 text-[15px] last:border-0"
                  >
                    {item.label}
                  </Link>
                ))}
                <a href={`tel:${site.phoneHref}`} className="py-3 text-[15px] font-medium text-accent-ink">
                  {site.phone}
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
