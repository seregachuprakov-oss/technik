import { query } from "@/server/db";

export interface LeadInput {
  topic: "general" | "rental" | "callback";
  name: string;
  phone: string;
  channelPref: "call" | "telegram" | "vk" | "max" | "whatsapp";
  message?: string;
}

/**
 * Сохраняет заявку. Отправка в Telegram/VK/MAX НЕ реализована в эту фазу —
 * см. docs/BOTS_TODO.md. Заявки нужно обрабатывать вручную из /admin/leads,
 * пока боты не подключены.
 */
export async function createLead(input: LeadInput): Promise<string> {
  const rows = await query<{ id: string }>(
    `INSERT INTO leads (topic, name, phone, channel_pref, message) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [input.topic, input.name.trim(), input.phone.trim(), input.channelPref, input.message?.trim() || null],
  );
  return rows[0]!.id;
}
