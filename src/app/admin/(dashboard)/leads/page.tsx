import { query } from "@/server/db";
import { PageHeader, Panel, Table, EmptyRow } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const TOPIC: Record<string, string> = { rental: "прокат", contact: "вопрос" };
const CHANNEL: Record<string, string> = {
  call: "звонок",
  telegram: "Telegram",
  vk: "VK",
  whatsapp: "WhatsApp",
};

export default async function AdminLeadsPage() {
  const leads = await query(
    `SELECT topic, name, phone, channel_pref, message, status, created_at
     FROM leads ORDER BY created_at DESC LIMIT 100`,
  );

  return (
    <div>
      <PageHeader
        title="Заявки"
        description="Обращения из формы проката. Обрабатываются вручную: позвонить или написать в указанный мессенджер."
        help="Автоматических уведомлений может не быть: письма уходят только если в .env.local заполнен SMTP, а боты Telegram/VK/MAX ещё не подключены (docs/BOTS_TODO.md). Пока это так, страницу нужно открывать самому хотя бы раз в день, иначе заявка пролежит незамеченной."
      />

      <Panel>
        <Table head={["Когда", "Тема", "Имя", "Телефон", "Канал", "Сообщение"]}>
          {leads.length === 0 && <EmptyRow colSpan={6}>Заявок пока нет.</EmptyRow>}
          {leads.map((l, i) => {
            const row = l as Record<string, unknown>;
            return (
              <tr key={i} className="align-top transition-colors hover:bg-sunk/50">
                <td className="tnum whitespace-nowrap px-4 py-2.5 text-muted">
                  {new Date(String(row.created_at)).toLocaleString("ru-RU")}
                </td>
                <td className="px-4 py-2.5">{TOPIC[String(row.topic)] ?? String(row.topic)}</td>
                <td className="px-4 py-2.5 font-medium">{String(row.name)}</td>
                <td className="tnum whitespace-nowrap px-4 py-2.5">
                  <a href={`tel:${String(row.phone)}`} className="text-accent-ink hover:underline">
                    {String(row.phone)}
                  </a>
                </td>
                <td className="px-4 py-2.5 text-muted">
                  {CHANNEL[String(row.channel_pref)] ?? String(row.channel_pref)}
                </td>
                <td className="max-w-80 px-4 py-2.5 text-muted">{String(row.message ?? "—")}</td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}
