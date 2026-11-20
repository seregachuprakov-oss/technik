import { query, queryOne } from "@/server/db";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort: number;
}

export interface Product {
  id: string;
  onec_id: string | null;
  slug: string;
  name: string;
  description: string;
  article: string | null;
  barcode: string | null;
  unit: string;
  price_kopecks: number;
  price_source: "import" | "confirmed" | "estimated_placeholder";
  stock_qty: number;
  stock_updated_at: string | null;
  is_available: boolean;
  is_visible: boolean;
  category_id: string | null;
  category_name?: string;
  category_slug?: string;
  subcategory: string | null;
  specs: Record<string, string>;
  manual_override: boolean;
  overridden_fields: string[];
  image_path: string | null;
  image_source: "none" | "real_upload" | "ai_illustrative";
  is_demo: boolean;
  sort: number;
}

export async function getCategories(): Promise<Category[]> {
  return query<Category>(`SELECT id, slug, name, description, sort FROM categories WHERE is_active ORDER BY sort`);
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  return query<Product>(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.is_visible ORDER BY p.is_available DESC, p.sort LIMIT $1`,
    [limit],
  );
}

export async function getProducts(filters: { categorySlug?: string; minKopecks?: number; maxKopecks?: number; onlyAvailable?: boolean } = {}): Promise<Product[]> {
  const where: string[] = ["p.is_visible"];
  const params: unknown[] = [];
  if (filters.categorySlug) {
    params.push(filters.categorySlug);
    where.push(`c.slug = $${params.length}`);
  }
  if (filters.minKopecks !== undefined) {
    params.push(filters.minKopecks);
    where.push(`p.price_kopecks >= $${params.length}`);
  }
  if (filters.maxKopecks !== undefined) {
    params.push(filters.maxKopecks);
    where.push(`p.price_kopecks <= $${params.length}`);
  }
  if (filters.onlyAvailable) where.push("p.is_available");
  return query<Product>(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${where.join(" AND ")} ORDER BY p.is_available DESC, p.sort`,
    params,
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return queryOne<Product>(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.slug = $1 AND p.is_visible`,
    [slug],
  );
}

export async function getProductById(id: string): Promise<Product | null> {
  return queryOne<Product>(`SELECT p.* FROM products p WHERE p.id = $1`, [id]);
}
