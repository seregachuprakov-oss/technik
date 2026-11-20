export interface InputFacts {
  name: string;
  category: string | null;
  subcategory: string | null;
  article: string | null;
  barcode: string | null;
  specs: Record<string, string>;
  existing_description: string | null;
}

export interface CrossCheckWarning {
  type: "unsupported_number";
  value: string;
  note: string;
}

export interface EnrichmentDraft {
  id: string;
  product_id: string;
  status: "pending_review" | "approved" | "rejected";
  input_facts: InputFacts;
  source_note: string | null;
  draft_description: string | null;
  draft_image_path: string | null;
  draft_image_source: "ai_illustrative" | null;
  draft_image_error: string | null;
  cross_check_warnings: CrossCheckWarning[];
  ai_text_model: string | null;
  ai_image_model: string | null;
  created_by: string;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
}
