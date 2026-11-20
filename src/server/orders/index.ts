import { randomBytes } from "node:crypto";
import { withTransaction } from "@/server/db";

export interface CheckoutLine {
  productId: string;
  qty: number;
}

export interface CheckoutInput {
  name: string;
  phone: string;
  fulfillment: "pickup" | "delivery";
  address?: string;
  comment?: string;
  lines: CheckoutLine[];
}

export interface CheckoutResult {
  orderId: string;
  orderNo: number;
  publicToken: string;
  totalKopecks: number;
}

/**
 * Демо-оформление заказа: у магазина нет эквайринга, поэтому заказ только
 * создаётся со статусом "ожидает подтверждения" и is_demo=true — реальная
 * оплата на сайте НЕ принимается, менеджер связывается с покупателем сам.
 * ORDERS_MODE в env зарезервирован под будущий переключатель demo → live,
 * когда появится реальный договор с эквайером — сейчас live недостижим.
 */
export async function createDemoOrder(input: CheckoutInput): Promise<CheckoutResult> {
  if (input.lines.length === 0) throw new Error("Корзина пуста");

  return withTransaction(async (client) => {
    const productIds = input.lines.map((l) => l.productId);
    const { rows: products } = await client.query<{ id: string; name: string; price_kopecks: number; is_available: boolean }>(
      `SELECT id, name, price_kopecks, is_available FROM products WHERE id = ANY($1)`,
      [productIds],
    );
    const byId = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const items: { productId: string; name: string; unitPrice: number; qty: number; lineTotal: number }[] = [];
    for (const line of input.lines) {
      const product = byId.get(line.productId);
      if (!product) continue; // товар удалён/скрыт — пропускаем строку
      const lineTotal = product.price_kopecks * line.qty;
      subtotal += lineTotal;
      items.push({ productId: product.id, name: product.name, unitPrice: product.price_kopecks, qty: line.qty, lineTotal });
    }
    if (items.length === 0) throw new Error("Все товары в корзине недоступны");

    const publicToken = randomBytes(12).toString("base64url");
    const orderRes = await client.query<{ id: string; order_no: string }>(
      `INSERT INTO orders (public_token, customer_name, customer_phone, fulfillment, address, comment, subtotal_kopecks, total_kopecks, is_demo, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,'pending_confirmation')
       RETURNING id, order_no`,
      [publicToken, input.name.trim(), input.phone.trim(), input.fulfillment, input.address ?? null, input.comment ?? null, subtotal, subtotal],
    );
    const order = orderRes.rows[0]!;

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price_kopecks, qty, line_total_kopecks)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [order.id, item.productId, item.name, item.unitPrice, item.qty, item.lineTotal],
      );
    }

    return { orderId: order.id, orderNo: Number(order.order_no), publicToken, totalKopecks: subtotal };
  });
}

export async function getOrderByToken(token: string) {
  const { query } = await import("@/server/db");
  const order = await query(
    `SELECT id, order_no, status, customer_name, customer_phone, fulfillment, address, comment, total_kopecks, is_demo, created_at
     FROM orders WHERE public_token = $1`,
    [token],
  );
  if (order.length === 0) return null;
  const items = await query(
    `SELECT product_name, unit_price_kopecks, qty, line_total_kopecks FROM order_items WHERE order_id = $1`,
    [order[0]!.id],
  );
  return { order: order[0]!, items };
}
