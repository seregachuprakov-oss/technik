"use server";
import { z } from "zod";
import { createDemoOrder } from "@/server/orders";

const schema = z.object({
  name: z.string().min(2, "Укажите имя"),
  phone: z.string().min(5, "Укажите телефон"),
  fulfillment: z.enum(["pickup", "delivery"]),
  address: z.string().optional(),
  comment: z.string().optional(),
  lines: z.array(z.object({ productId: z.string().uuid(), qty: z.number().int().positive() })).min(1),
});

export interface SubmitOrderResult {
  ok: boolean;
  error?: string;
  publicToken?: string;
  orderNo?: number;
}

export async function submitOrder(input: unknown): Promise<SubmitOrderResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Проверьте форму" };
  }
  try {
    const result = await createDemoOrder(parsed.data);
    return { ok: true, publicToken: result.publicToken, orderNo: result.orderNo };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Не удалось создать заказ" };
  }
}
