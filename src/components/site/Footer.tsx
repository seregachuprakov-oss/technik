import Link from "next/link";
import { MapPin, Clock, Phone } from "lucide-react";
import { site } from "@/config/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="on-dark mt-auto">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo className="h-7" />
          <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-muted">
            Магазин инструмента и крепежа в Котласе. Всё, что в каталоге, можно взять
            в руки на Мира, 28 — в тот же день, без ожидания доставки.
          </p>
        </div>

        <div className="text-[13.5px]">
          <div className="mb-3 text-[11px] uppercase tracking-[0.1em] text-faint">Покупателям</div>
          <div className="space-y-2 text-muted">
            <Link href="/catalog" className="block transition-colors hover:text-text">Каталог</Link>
            <Link href="/rental" className="block transition-colors hover:text-text">Прокат инструмента</Link>
            <Link href="/cart" className="block transition-colors hover:text-text">Корзина</Link>
            <Link href="/account" className="block transition-colors hover:text-text">Личный кабинет</Link>
          </div>
        </div>

        <div className="text-[13.5px]">
          <div className="mb-3 text-[11px] uppercase tracking-[0.1em] text-faint">Магазин</div>
          <div className="space-y-2.5 text-muted">
            <p className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-accent" /> {site.address}
            </p>
            <p className="flex items-start gap-2">
              <Clock size={14} className="mt-0.5 shrink-0 text-accent" /> {site.hours}
            </p>
            <a href={`tel:${site.phoneHref}`} className="flex items-start gap-2 transition-colors hover:text-text">
              <Phone size={14} className="mt-0.5 shrink-0 text-accent" /> {site.phone}
            </a>
          </div>
        </div>

        <div className="text-[13.5px]">
          <div className="mb-3 text-[11px] uppercase tracking-[0.1em] text-faint">Реквизиты</div>
          <div className="space-y-1.5 text-muted">
            <p>{site.legalName}</p>
            <p className="tnum">ОГРНИП {site.ogrnip} от {site.ogrnipDate}</p>
            <p className="tnum">ИНН {site.inn}, {site.taxRegime}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-4 text-[12px] text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} «{site.name}», Котлас</span>
          <span>Оплата на сайте не принимается: заказ подтверждаем по телефону, платите в магазине.</span>
        </div>
      </div>
    </footer>
  );
}
