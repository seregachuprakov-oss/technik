"use server";
import { revalidatePath } from "next/cache";
import { query } from "@/server/db";
import { createEnrichmentDraft } from "@/server/enrichment/run";
import { approveDraft, rejectDraft } from "@/server/enrichment/review";
import type { EnrichmentDraft } from "@/server/enrichment/types";

export async function listProductsForPicker(): Promise<Array<{ id: string; name: string; onec_id: string | null; article: string | null; is_demo: boolean }>> {
  return query(`SELECT id, name, onec_id, article, is_demo FROM products ORDER BY is_demo, name LIMIT 500`);
}

export async function generateDraftAction(formData: FormData): Promise<EnrichmentDraft> {
  const productId = String(formData.get("product_id") ?? "");
  if (!productId) throw new Error("Выберите товар");
  const sourceNote = String(formData.get("source_note") ?? "").trim() || null;
  const generateImage = formData.get("generate_image") === "on";
  const draft = await createEnrichmentDraft(productId, { sourceNote, generateImage, actor: "admin" });
  revalidatePath("/admin/enrichment");
  return draft;
}

export async function approveDraftAction(draftId: string): Promise<void> {
  await approveDraft(draftId, "admin");
  revalidatePath("/admin/enrichment");
  revalidatePath("/admin/products");
  revalidatePath("/admin/changelog");
}

export async function rejectDraftAction(draftId: string, note?: string): Promise<void> {
  await rejectDraft(draftId, "admin", note);
  revalidatePath("/admin/enrichment");
}
