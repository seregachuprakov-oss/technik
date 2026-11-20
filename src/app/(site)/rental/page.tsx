import { LeadForm } from "@/components/site/LeadForm";
import { submitRentalLead } from "./actions";

export const metadata = { title: "Прокат инструмента" };

export default function RentalPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-accent)]">Прокат</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight">
            Инструмент на один проект, без покупки
          </h1>
          <p className="mt-6 text-[var(--color-muted)]">
            Бывает, что дрель или перфоратор нужны один раз: сделать ремонт, повесить полки, собрать мебель.
            Опишите, что нужно и на какой срок — мы подскажем, есть ли этот инструмент в прокате и сколько это будет стоить.
            Это заявка, а не онлайн-бронирование: окончательные условия и залог обсуждаем по телефону.
          </p>
          <p className="mt-6 text-sm text-[var(--color-muted)]">
            Раздел работает как форма заявки. Расчёт стоимости проката и бронирование по календарю — в следующей версии сайта.
          </p>
        </div>
        <div>
          <LeadForm action={submitRentalLead} submitLabel="Узнать про прокат" />
        </div>
      </div>
    </div>
  );
}
