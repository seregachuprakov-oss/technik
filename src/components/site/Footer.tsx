import Link from "next/link";
import { site } from "@/config/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            Инструмент и крепёж в Котласе. На полке, а не только на экране.
          </p>
        </div>
        <div className="text-sm text-[var(--color-muted)]">
          <div className="mb-3 font-medium text-[var(--color-text)]">Магазин</div>
          <div className="space-y-2">
            <p>{site.address}</p>
            <p>{site.hours}</p>
            <a href={`tel:${site.phoneHref}`} className="block hover:text-[var(--color-text)]">{site.phone}</a>
          </div>
        </div>
        <div className="text-sm text-[var(--color-muted)]">
          <div className="mb-3 font-medium text-[var(--color-text)]">Покупателям</div>
          <div className="space-y-2">
            <Link href="/catalog" className="block hover:text-[var(--color-text)]">Каталог</Link>
            <Link href="/rental" className="block hover:text-[var(--color-text)]">Прокат инструмента</Link>
            <Link href="/account" className="block hover:text-[var(--color-text)]">Личный кабинет</Link>
          </div>
        </div>
        <div className="text-sm text-[var(--color-muted)]">
          <div className="mb-3 font-medium text-[var(--color-text)]">Реквизиты</div>
          <div className="space-y-1">
            <p>{site.legalName}</p>
            <p>ОГРНИП {site.ogrnip} от {site.ogrnipDate}</p>
            <p>ИНН {site.inn}, {site.taxRegime}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-line)] px-4 py-4 text-center text-xs text-[var(--color-muted)] sm:px-6">
        © {new Date().getFullYear()} «{site.name}», Котлас. Сайт — демонстрационная версия, оплата на сайте не принимается.
      </div>
    </footer>
  );
}
