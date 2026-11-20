import Link from "next/link";
import { Package, Upload, History, ShoppingBag, MessageSquare, LayoutDashboard, LogOut, ExternalLink } from "lucide-react";
import { logoutAdmin } from "@/server/auth/admin";
import { Logo } from "@/components/site/Logo";
import { AdminNavLink } from "./NavLink";

/**
 * Меню сгруппировано по тому, зачем человек сюда зашёл: «посмотреть, что
 * происходит», «поправить товары», «разобрать обращения». Плоский список из
 * шести пунктов заставлял каждый раз перечитывать все шесть.
 */
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  exact?: boolean;
}

const GROUPS: { title: string | null; items: NavItem[] }[] = [
  {
    title: null,
    items: [{ href: "/admin", label: "Обзор", icon: LayoutDashboard, exact: true }],
  },
  {
    title: "Каталог",
    items: [
      { href: "/admin/products", label: "Товары", icon: Package },
      { href: "/admin/import", label: "Импорт из 1С", icon: Upload },
      { href: "/admin/changelog", label: "Журнал изменений", icon: History },
    ],
  },
  {
    title: "Покупатели",
    items: [
      { href: "/admin/orders", label: "Заказы", icon: ShoppingBag },
      { href: "/admin/leads", label: "Заявки", icon: MessageSquare },
    ],
  },
];

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="on-dark sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line px-4 py-5 md:flex">
        <Link href="/admin" className="px-2 text-text">
          <Logo className="h-6" />
        </Link>
        <p className="mt-1.5 px-2 text-[11px] uppercase tracking-[0.12em] text-faint">Панель магазина</p>

        <nav className="mt-7 flex-1 space-y-6 overflow-y-auto">
          {GROUPS.map((group, i) => (
            <div key={group.title ?? `g${i}`}>
              {group.title && (
                <div className="mb-1.5 px-2 text-[10.5px] uppercase tracking-[0.12em] text-faint">{group.title}</div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <AdminNavLink key={item.href} href={item.href} exact={item.exact}>
                    <item.icon size={15} strokeWidth={1.9} />
                    {item.label}
                  </AdminNavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-4 space-y-1 border-t border-line pt-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] text-muted transition-colors hover:text-text"
          >
            <ExternalLink size={15} strokeWidth={1.9} /> Открыть сайт
          </a>
          <form
            action={async () => {
              "use server";
              await logoutAdmin();
              const { redirect } = await import("next/navigation");
              redirect("/admin/login");
            }}
          >
            <button className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] text-muted transition-colors hover:text-text">
              <LogOut size={15} strokeWidth={1.9} /> Выйти
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Телефон: сайдбара нет, поэтому меню переезжает в верхнюю полосу
            с горизонтальной прокруткой — фото товара чаще всего загружают
            именно с телефона, прямо у полки. */}
        <div className="on-dark sticky top-0 z-30 md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/admin" className="text-text">
              <Logo className="h-6" />
            </Link>
            <form
              action={async () => {
                "use server";
                await logoutAdmin();
                const { redirect } = await import("next/navigation");
                redirect("/admin/login");
              }}
            >
              <button className="flex items-center gap-1.5 text-[12.5px] text-muted">
                <LogOut size={14} /> Выйти
              </button>
            </form>
          </div>
          <div className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2">
            {GROUPS.flatMap((g) => g.items).map((item) => (
              <AdminNavLink key={item.href} href={item.href} exact={item.exact}>
                <item.icon size={14} strokeWidth={1.9} />
                <span className="whitespace-nowrap">{item.label}</span>
              </AdminNavLink>
            ))}
          </div>
        </div>

        <main className="px-5 py-7 sm:px-8 sm:py-9">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
