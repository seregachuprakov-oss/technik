import { withTransaction } from "@/server/db";

/**
 * Подтверждение AI-черновика — ЕДИНСТВЕННЫЙ путь, которым описание/фото из
 * enrichment_drafts попадает в products. Публикация задним числом/автоматом
 * невозможна: approveDraft вызывается только из серверного действия
 * /admin/enrichment, которое требует requireAdmin() (см. layout дашборда).
 *
 * Пишем в product_change_log тем же способом, что и обычная ручная правка
 * (actor='admin'), но с отдельным reason, чтобы в истории товара было видно,
 * что текст пришёл от AI и когда его одобрили — тот же паттерн защиты,
 * что уже используется для импорта из 1С (см. src/server/import/run.ts).
 */
export async function approveDraft(draftId: string, actor = "admin"): Promise<void> {
  await withTransaction(async (client) => {
    const draft = await client.query<{
      id: string; product_id: string; draft_description: string | null;
      draft_image_path: string | null; draft_image_source: string | null; status: string;
    }>(`SELECT id, product_id, draft_description, draft_image_path, draft_image_source, status FROM enrichment_drafts WHERE id = $1 FOR UPDATE`, [draftId]);
    const d = draft.rows[0];
    if (!d) throw new Error("Черновик не найден");
    if (d.status !== "pending_review") throw new Error("Черновик уже обработан");

    const product = await client.query<{ name: string; description: string; image_path: string | null; image_source: string }>(
      `SELECT name, description, image_path, image_source FROM products WHERE id = $1`,
      [d.product_id],
    );
    const p = product.rows[0];
    if (!p) throw new Error("Товар не найден");

    if (d.draft_description && d.draft_description !== p.description) {
      await client.query(
        `INSERT INTO product_change_log (product_id, field, old_value, new_value, reason, actor) VALUES ($1,'description',$2,$3,'ai_enrichment_approved',$4)`,
        [d.product_id, p.description, d.draft_description, actor],
      );
      await client.query(`UPDATE products SET description = $2, updated_at = now() WHERE id = $1`, [d.product_id, d.draft_description]);
    }

    if (d.draft_image_path && d.draft_image_source === "ai_illustrative") {
      await client.query(
        `INSERT INTO product_change_log (product_id, field, old_value, new_value, reason, actor) VALUES ($1,'image_path',$2,$3,'ai_enrichment_approved',$4)`,
        [d.product_id, p.image_path, d.draft_image_path, actor],
      );
      await client.query(`UPDATE products SET image_path = $2, image_source = 'ai_illustrative', updated_at = now() WHERE id = $1`, [d.product_id, d.draft_image_path]);
    }

    await client.query(
      `UPDATE enrichment_drafts SET status = 'approved', reviewed_by = $2, reviewed_at = now() WHERE id = $1`,
      [draftId, actor],
    );
  });
}

export async function rejectDraft(draftId: string, actor = "admin", note?: string): Promise<void> {
  await withTransaction(async (client) => {
    const res = await client.query(`UPDATE enrichment_drafts SET status = 'rejected', reviewed_by = $2, reviewed_at = now(), review_note = $3 WHERE id = $1 AND status = 'pending_review'`, [draftId, actor, note ?? null]);
    if (res.rowCount === 0) throw new Error("Черновик не найден или уже обработан");
  });
}
