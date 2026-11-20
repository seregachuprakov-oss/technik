import { CalendarClock, Hammer, Wallet, Phone } from "lucide-react";
import { LeadForm } from "@/components/site/LeadForm";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/config/site";
import { submitRentalLead } from "./actions";

export const metadata = { title: "Прокат инструмента" };

const STEPS = [
  {
    icon: Hammer,
    title: "Говорите, что нужно",
    text: "Перфоратор на день, плиткорез на выходные, краскопульт на один заход — опишите задачу, подскажем, чем её закрыть.",
  },
  {
    icon: CalendarClock,
    title: "Мы проверяем и перезваниваем",
    text: "Скажем, свободен ли инструмент на эти даты. Календарь брони на сайте пока не ведём — всё через телефон.",
  },
  {
    icon: Wallet,
    title: "Залог и условия — на месте",
    text: "Сумму суток и залог называем при выдаче, до подписания ничего платить не нужно.",
  },
];

export default function RentalPage() {
  return (
    <div>
      <section className="on-dark relative overflow-hidden">
        <div className="blueprint absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <span className="text-[11.5px] font-medium uppercase tracking-[0.16em] text-accent-ink">Прокат</span>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-[clamp(2rem,4.8vw,3.1rem)] font-semibold leading-[1.06]">
            Инструмент под одну задачу — брать насовсем необязательно
          </h1>
          <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-muted">
            Повесить полки, сделать стяжку, собрать баню — для разовой работы дешевле взять
            инструмент на день, чем покупать и ставить в гараж.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[1.15fr_400px] lg:py-20">
        <div>
          <div className="space-y-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <div className="flex gap-4 rounded-lg border border-line bg-card p-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-accent-soft text-accent-ink">
                    <s.icon size={18} strokeWidth={1.9} />
                  </span>
                  <div>
                    <h2 className="font-display text-[15.5px] font-semibold">{s.title}</h2>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{s.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-line bg-sunk/60 p-5 text-[13px] leading-relaxed text-muted">
            <p className="font-medium text-text">Что этот раздел пока не умеет</p>
            <p className="mt-1.5">
              Выбрать дату и забронировать инструмент прямо на сайте нельзя — расчёт стоимости и
              календарь появятся позже. Сейчас форма передаёт заявку менеджеру, а дальше разговор
              по телефону. Срочно — звоните{" "}
              <a href={`tel:${site.phoneHref}`} className="font-medium text-accent-ink underline-offset-4 hover:underline">
                {site.phone}
              </a>
              .
            </p>
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-line bg-card p-6 shadow-s1">
            <h2 className="font-display text-[17px] font-semibold">Заявка на прокат</h2>
            <p className="mt-1.5 text-[13px] text-muted">
              Ответим в рабочее время: {site.hours}.
            </p>
            <div className="mt-5">
              <LeadForm action={submitRentalLead} submitLabel="Отправить заявку" />
            </div>
            <a
              href={`tel:${site.phoneHref}`}
              className="mt-4 flex items-center justify-center gap-2 rounded-md border border-line py-2.5 text-[13px] font-medium transition-colors hover:border-accent hover:text-accent-ink"
            >
              <Phone size={14} /> {site.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
