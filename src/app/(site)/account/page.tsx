import { UserRound, ReceiptText, Hammer, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { site } from "@/config/site";

export const metadata = { title: "Личный кабинет" };

const PLANNED = [
  { icon: ReceiptText, title: "История заказов", text: "Что покупали и по какой цене — чтобы повторить заказ одной кнопкой." },
  { icon: Hammer, title: "Инструмент в прокате", text: "Сроки возврата и залог по текущей аренде." },
  { icon: UserRound, title: "Вход по номеру телефона", text: "Код из SMS вместо пароля. Регистрация для покупки по-прежнему не понадобится." },
];

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-accent" />
        <span className="text-[11.5px] font-medium uppercase tracking-[0.16em] text-accent-ink">Раздел в работе</span>
      </div>

      <h1 className="mt-5 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-tight">
        Личный кабинет ещё не включён
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
        Авторизации на сайте пока нет — и мы не делаем вид, что она есть. Заказ оформляется
        без регистрации: достаточно корзины и телефона. Ссылку на страницу заказа можно
        сохранить, по ней видно состав и сумму.
      </p>

      <div className="mt-10 space-y-2">
        {PLANNED.map((p) => (
          <div key={p.title} className="flex gap-4 rounded-lg border border-dashed border-line-strong bg-card p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-sunk text-faint">
              <p.icon size={18} strokeWidth={1.9} />
            </span>
            <div>
              <h2 className="text-[14.5px] font-medium">{p.title}</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{p.text}</p>
            </div>
            <span className="ml-auto self-start rounded-xs bg-sunk px-2 py-1 text-[10.5px] uppercase tracking-[0.06em] text-faint">
              позже
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button href="/catalog">В каталог</Button>
        <Button href={`tel:${site.phoneHref}`} variant="outline">
          <Phone size={15} /> {site.phone}
        </Button>
      </div>
    </div>
  );
}
