import { query } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await query(
    `SELECT topic, name, phone, channel_pref, message, status, created_at FROM leads ORDER BY created_at DESC LIMIT 100`,
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Заявки</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Прокат инструмента и обратная связь. Боты Telegram/VK/MAX не подключены (см. docs/BOTS_TODO.md) — обрабатывать вручную по телефону.
      </p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--color-line)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface)] text-left text-[var(--color-muted)]">
            <tr><th className="p-3">Когда</th><th className="p-3">Тема</th><th className="p-3">Имя</th><th className="p-3">Телефон</th><th className="p-3">Канал</th><th className="p-3">Сообщение</th></tr>
          </thead>
          <tbody>
            {leads.length === 0 && <tr><td className="p-3 text-[var(--color-muted)]" colSpan={6}>Заявок пока нет</td></tr>}
            {leads.map((l, i) => {
              const row = l as Record<string, unknown>;
              return (
                <tr key={i} className="border-t border-[var(--color-line)]">
                  <td className="p-3 text-[var(--color-muted)]">{new Date(String(row.created_at)).toLocaleString("ru-RU")}</td>
                  <td className="p-3">{row.topic === "rental" ? "прокат" : String(row.topic)}</td>
                  <td className="p-3">{String(row.name)}</td>
                  <td className="p-3">{String(row.phone)}</td>
                  <td className="p-3 text-[var(--color-muted)]">{String(row.channel_pref)}</td>
                  <td className="p-3 text-[var(--color-muted)]">{String(row.message ?? "—")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
