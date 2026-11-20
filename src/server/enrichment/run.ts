import { query, queryOne } from "@/server/db";
import { aiConfigured, AI_TEXT_MODEL } from "@/server/ai/client";
import { aiImageConfigured, generateIllustrativeProductImage } from "@/server/ai/image";
import { draftProductDescription } from "./draftText";
import { crossCheckDraft } from "./crossCheck";
import { saveDraftImage } from "./storage";
import type { EnrichmentDraft, InputFacts } from "./types";

interface ProductRow {
  id: string;
  name: string;
  subcategory: string | null;
  article: string | null;
  barcode: string | null;
  specs: Record<string, string>;
  description: string;
  category_name: string | null;
}

async function loadFacts(productId: string): Promise<{ productId: string; facts: InputFacts } | null> {
  const row = await queryOne<ProductRow>(
    `SELECT p.id, p.name, p.subcategory, p.article, p.barcode, p.specs, p.description, c.name AS category_name
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1`,
    [productId],
  );
  if (!row) return null;
  return {
    productId: row.id,
    facts: {
      name: row.name,
      category: row.category_name,
      subcategory: row.subcategory,
      article: row.article,
      barcode: row.barcode,
      specs: row.specs ?? {},
      existing_description: row.description?.trim() || null,
    },
  };
}

function buildImagePrompt(facts: InputFacts): string {
  const specsLine = Object.entries(facts.specs).map(([k, v]) => `${k}: ${v}`).join("; ");
  return (
    "Generate an ORIGINAL, photorealistic studio product photo for a small hardware/tools store's " +
    "e-commerce catalog. This is an illustrative generic image, NOT a photo of any specific real " +
    "product on the shelf and NOT a copy of any manufacturer's or competitor's catalog photo. " +
    "Do not render any brand logos, packaging text, model numbers or watermarks — keep the design " +
    "generic and unbranded. Clean, neutral studio background, soft even lighting, centered " +
    "composition suitable for a product listing thumbnail. " +
    `Product type: ${facts.name}` +
    (facts.category ? `, category: ${facts.category}` : "") +
    (facts.subcategory ? `, ${facts.subcategory}` : "") +
    (specsLine ? `. Known attributes (for visual accuracy only, do not render as text): ${specsLine}` : "") +
    ". Square aspect ratio."
  );
}

export interface CreateDraftOptions {
  sourceNote?: string | null;
  generateImage?: boolean;
  actor?: string;
}

export async function createEnrichmentDraft(productId: string, options: CreateDraftOptions = {}): Promise<EnrichmentDraft> {
  const loaded = await loadFacts(productId);
  if (!loaded) throw new Error("Товар не найден");
  const { facts } = loaded;
  const sourceNote = options.sourceNote?.trim() || null;
  const actor = options.actor ?? "admin";

  if (!aiConfigured()) throw new Error("AI-текст не настроен (нет ANTHROPIC_API_KEY / CONTENT_FACTORY_RELAY_URL)");

  const textResult = await draftProductDescription(facts, sourceNote);
  const warnings = crossCheckDraft(textResult.description, facts, sourceNote);

  const ins = await queryOne<{ id: string }>(
    `INSERT INTO enrichment_drafts
       (product_id, input_facts, source_note, draft_description, cross_check_warnings, ai_text_model, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [productId, JSON.stringify(facts), sourceNote, textResult.description, JSON.stringify([...warnings, ...textResult.uncertain.map((u) => ({ type: "uncertain", value: "", note: u }))]), textResult.rawModel ?? AI_TEXT_MODEL, actor],
  );
  const draftId = ins!.id;

  if (options.generateImage) {
    if (!aiImageConfigured()) {
      await query(`UPDATE enrichment_drafts SET draft_image_error = $2 WHERE id = $1`, [draftId, "AI-изображения не настроены"]);
    } else {
      const imgResult = await generateIllustrativeProductImage(buildImagePrompt(facts));
      if (imgResult.ok) {
        const publicPath = await saveDraftImage(draftId, imgResult.bytes);
        await query(
          `UPDATE enrichment_drafts SET draft_image_path = $2, draft_image_source = 'ai_illustrative', ai_image_model = $3 WHERE id = $1`,
          [draftId, publicPath, "gemini-2.5-flash-image"],
        );
      } else {
        await query(`UPDATE enrichment_drafts SET draft_image_error = $2 WHERE id = $1`, [draftId, imgResult.error]);
      }
    }
  }

  const draft = await queryOne<EnrichmentDraft>(`SELECT * FROM enrichment_drafts WHERE id = $1`, [draftId]);
  return draft!;
}

export async function listDraftsForProduct(productId: string): Promise<EnrichmentDraft[]> {
  return query<EnrichmentDraft>(`SELECT * FROM enrichment_drafts WHERE product_id = $1 ORDER BY created_at DESC`, [productId]);
}

export async function listPendingDrafts(): Promise<Array<EnrichmentDraft & { product_name: string; product_onec_id: string | null; is_demo: boolean }>> {
  return query(
    `SELECT d.*, p.name AS product_name, p.onec_id AS product_onec_id, p.is_demo
     FROM enrichment_drafts d JOIN products p ON p.id = d.product_id
     WHERE d.status = 'pending_review' ORDER BY d.created_at DESC`,
  );
}

export async function listAllDrafts(limit = 50): Promise<Array<EnrichmentDraft & { product_name: string; is_demo: boolean }>> {
  return query(
    `SELECT d.*, p.name AS product_name, p.is_demo
     FROM enrichment_drafts d JOIN products p ON p.id = d.product_id
     ORDER BY d.created_at DESC LIMIT $1`,
    [limit],
  );
}
