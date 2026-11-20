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

/* ------------------------------------------------------------------ */
/*  Фото товара: ручная загрузка сотрудником                           */
/* ------------------------------------------------------------------ */

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"];

export interface UploadImageResult {
  ok: boolean;
  error?: string;
  imagePath?: string;
}

/**
 * Загрузка настоящего фото товара поверх иллюстрации.
 *
 * Файл приводится к WebP 1400px по длинной стороне: снимок с телефона весит
 * 4–8 МБ и грузится на мобильном интернете секундами, после пережатия — 100–200 КБ.
 * Путь /uploads/... одновременно служит признаком «это настоящее фото»:
 * под такими картинками сайт не ставит плашку «Фото иллюстративное».
 *
 * Каталог public/uploads исключён из rsync при деплое (scripts/deploy.sh),
 * поэтому выложенные фото переживают выкладку новой версии сайта.
 */
export async function uploadProductImage(productId: string, formData: FormData): Promise<UploadImageResult> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Файл не выбран" };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "Файл больше 12 МБ — уменьшите снимок" };
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: `Формат ${file.type} не поддерживается: нужен JPEG, PNG, HEIC или WebP` };
  }

  const current = await queryOne<{ image_path: string | null }>(
    `SELECT image_path FROM products WHERE id = $1`,
    [productId],
  );
  if (!current) return { ok: false, error: "Товар не найден" };

  try {
    const [fs, path] = await Promise.all([import("node:fs/promises"), import("node:path")]);

    const dir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.mkdir(dir, { recursive: true });

    const stamp = `${productId}-${Date.now().toString(36)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    let filename = `${stamp}.webp`;

    try {
      const { default: sharp } = await import("sharp");
      await sharp(buffer)
        .rotate() // учесть EXIF-ориентацию: иначе фото с телефона ложится набок
        .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(path.join(dir, filename));
    } catch (sharpError) {
      // Нативная часть sharp может не подняться (не те бинарники под платформу).
      // Это не повод отказывать сотруднику в загрузке: кладём оригинал как есть,
      // он просто будет тяжелее. Причину пишем в лог сервера.
      console.error("sharp недоступен, фото сохраняется без пережатия:", sharpError);
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      filename = `${stamp}.${ext}`;
      await fs.writeFile(path.join(dir, filename), buffer);
    }

    const imagePath = `/uploads/products/${filename}`;

    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO product_change_log (product_id, field, old_value, new_value, reason, actor)
         VALUES ($1,'image_path',$2,$3,'admin_upload','admin')`,
        [productId, current.image_path, imagePath],
      );
      await client.query(`UPDATE products SET image_path = $2, updated_at = now() WHERE id = $1`, [productId, imagePath]);
    });

    // Старое загруженное фото больше никому не нужно; сгенерированные
    // иллюстрации (не из /uploads) не трогаем — они общие для пайплайна.
    if (current.image_path?.startsWith("/uploads/products/")) {
      await fs.rm(path.join(process.cwd(), "public", current.image_path), { force: true }).catch(() => {});
    }

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    return { ok: true, imagePath };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? `Не удалось обработать файл: ${e.message}` : "Не удалось обработать файл" };
  }
}

/** Убрать фото: карточка вернётся к иллюстрации/заглушке. */
export async function removeProductImage(productId: string): Promise<UploadImageResult> {
  const current = await queryOne<{ image_path: string | null }>(
    `SELECT image_path FROM products WHERE id = $1`,
    [productId],
  );
  if (!current?.image_path) return { ok: false, error: "У товара и так нет фото" };

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO product_change_log (product_id, field, old_value, new_value, reason, actor)
       VALUES ($1,'image_path',$2,NULL,'admin_edit','admin')`,
      [productId, current.image_path],
    );
    await client.query(`UPDATE products SET image_path = NULL, updated_at = now() WHERE id = $1`, [productId]);
  });

  if (current.image_path.startsWith("/uploads/products/")) {
    const [fs, path] = await Promise.all([import("node:fs/promises"), import("node:path")]);
    await fs.rm(path.join(process.cwd(), "public", current.image_path), { force: true }).catch(() => {});
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  return { ok: true };
}
