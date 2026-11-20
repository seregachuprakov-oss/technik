import { Button } from "@/components/ui/Button";

export const metadata = { title: "Личный кабинет" };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-2xl font-bold">Личный кабинет</h1>
      <p className="mt-4 text-[var(--color-muted)]">
        Раздел пока не подключён к реальной авторизации — это место-заглушка под историю заказов
        и сохранённые адреса, которые появятся в следующей версии сайта. Сейчас для заказа
        достаточно оформить его из корзины, без регистрации.
      </p>
      <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-line)] p-6 text-sm text-[var(--color-muted)]">
        Вход по номеру телефона с SMS-кодом — в разработке, не функционирует.
      </div>
      <Button href="/catalog" variant="outline" className="mt-8">В каталог</Button>
    </div>
  );
}
