import Link from "next/link";
import { logoutAdmin } from "@/server/auth/admin";
import { Logo } from "@/components/site/Logo";

const NAV = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/import", label: "Импорт из 1С" },
  { href: "/admin/changelog", label: "Журнал изменений" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/leads", label: "Заявки" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-[var(--color-line)] bg-[var(--color-surface)] p-5">
        <Logo className="mb-8" />
        <nav className="space-y-1 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-[var(--color-muted)] transition hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]">
              {item.label}
            </Link>
          ))}
        </nav>
        <form
          action={async () => {
            "use server";
            await logoutAdmin();
            const { redirect } = await import("next/navigation");
            redirect("/admin/login");
          }}
          className="mt-8"
        >
          <button className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]">Выйти</button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
