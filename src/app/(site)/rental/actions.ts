"use server";
import { z } from "zod";
import { createLead } from "@/server/leads";

const schema = z.object({
  name: z.string().min(2, "Укажите имя"),
  phone: z.string().min(5, "Укажите телефон"),
  channelPref: z.enum(["call", "telegram", "vk", "max", "whatsapp"]),
  message: z.string().optional(),
});

export interface LeadFormResult {
  ok: boolean;
  error?: string;
}

export async function submitRentalLead(input: unknown): Promise<LeadFormResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Проверьте форму" };
  await createLead({ topic: "rental", ...parsed.data });
  return { ok: true };
}
