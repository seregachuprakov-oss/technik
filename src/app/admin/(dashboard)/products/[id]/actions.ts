"use server";
import { revalidatePath } from "next/cache";
import { query, queryOne, withTransaction } from "@/server/db";

const FIELDS = ["name", "description", "price"] as const;

export async function updateProduct(productId: string, formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceRub = Number(formData.get("price"));
  const priceKopecks = Math.round(priceRub * 100);
  const isVisible = formData.get("is_visible") === "on";
  const manualOverride = formData.get("manual_override") === "on";
  const overriddenFields = FIELDS.filter((f) => formData.get(`override_${f}`) === "on");

  const current = await queryOne<{ name: string; description: string; price_kopecks: number; is_visible: boolean; manual_override: boolean }>(
    `SELECT name, description, price_kopecks, is_visible, manual_override FROM products WHERE id = $1`,
    [productId],
  );
  if (!current) throw new Error("Товар не найден");

  await withTransaction(async (client) => {
    const log = async (field: string, oldValue: string, newValue: string) => {
      if (oldValue === newValue) return;
      await client.query(
        `INSERT INTO product_change_log (product_id, field, old_value, new_value, reason, actor) VALUES ($1,$2,$3,$4,'admin_edit','admin')`,
        [productId, field, oldValue, newValue],
      );
    };
    await log("name", current.name, name);
    await log("description", current.description, description);
    await log("price_kopecks", String(current.price_kopecks), String(priceKopecks));
    await log("is_visible", String(current.is_visible), String(isVisible));
    await log("manual_override", String(current.manual_override), String(manualOverride));

    await client.query(
      `UPDATE products SET name=$2, description=$3, price_kopecks=$4, price_source='confirmed', is_visible=$5,
         manual_override=$6, overridden_fields=$7, updated_at=now() WHERE id=$1`,
      [productId, name, description, priceKopecks, isVisible, manualOverride, overriddenFields],
    );
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
}

export async function getChangeLogForProduct(productId: string) {
  return query(
    `SELECT field, old_value, new_value, reason, actor, created_at FROM product_change_log WHERE product_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [productId],
  );
}
