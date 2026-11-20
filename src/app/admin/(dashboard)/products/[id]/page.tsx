import { notFound } from "next/navigation";
import { getProductById } from "@/server/catalog";
import { ProductForm } from "@/components/admin/ProductForm";
import { getChangeLogForProduct } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  const changes = await getChangeLogForProduct(id);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">{product.name}</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        {product.onec_id ? `GUID 1С: ${product.onec_id}` : "Товар создан вручную в админке (нет onec_id)"}
        {product.article ? ` · артикул ${product.article}` : ""}
      </p>

      <div className="mt-8">
        <ProductForm product={product} />
      </div>

      <h2 className="mt-12 font-display text-lg font-semibold">История изменений</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-line)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface)] text-left text-[var(--color-muted)]">
            <tr><th className="p-3">Когда</th><th className="p-3">Поле</th><th className="p-3">Было</th><th className="p-3">Стало</th><th className="p-3">Кто/почему</th></tr>
          </thead>
          <tbody>
            {changes.length === 0 && (
              <tr><td className="p-3 text-[var(--color-muted)]" colSpan={5}>Изменений пока нет</td></tr>
            )}
            {changes.map((c, i) => {
              const row = c as Record<string, unknown>;
              return (
                <tr key={i} className="border-t border-[var(--color-line)]">
                  <td className="p-3 text-[var(--color-muted)]">{new Date(String(row.created_at)).toLocaleString("ru-RU")}</td>
                  <td className="p-3">{String(row.field)}</td>
                  <td className="p-3 text-[var(--color-muted)]">{String(row.old_value ?? "—")}</td>
                  <td className="p-3">{String(row.new_value ?? "—")}</td>
                  <td className="p-3 text-[var(--color-muted)]">{String(row.actor)} · {String(row.reason)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
