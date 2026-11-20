import Link from "next/link";
import { ShoppingCart, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { site } from "@/config/site";
import { CartCountBadge } from "@/components/cart/CartCountBadge";

const NAV = [
  { href: "/catalog", label: "Каталог" },
  { href: "/rental", label: "Прокат инструмента" },
  { href: "/#about", label: "О магазине" },
  { href: "/account", label: "Личный кабинет" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-ink)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="text-[var(--color-text)] shrink-0">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[var(--color-muted)] md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[var(--color-text)]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <a
            href={`tel:${site.phoneHref}`}
            className="hidden items-center gap-2 text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] sm:flex"
          >
            <Phone size={16} />
            {site.phone}
          </a>
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-full border border-[var(--color-line)] px-3 py-2 text-sm transition hover:border-[var(--color-accent)]"
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Корзина</span>
            <CartCountBadge />
          </Link>
        </div>
      </div>
    </header>
  );
}
