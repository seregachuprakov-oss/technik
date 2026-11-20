import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getProductById } from "@/server/catalog";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader, Panel, Table, EmptyRow } from "@/components/admin/ui";
import { getChangeLogForProduct } from "./actions";

export const dynamic = "force-dynamic";

const REASON_LABEL: Record<string, string> = {
  admin_edit: "правка в админке",
  admin_upload: "загрузка фото",
  import_create: "создан импортом",
  import_update: "обновлён импортом",
  auto_hide_zero_stock: "авто: остаток 0",
  auto_unhide_restock: "авто: поступление",
};

const FIELD_LABEL: Record<string, string> = {
  name: "название",
  description: "описание",
  price_kopecks: "цена",
  is_visible: "видимость",
  manual_override: "ручная правка",
  is_available: "наличие",
  image_path: "фото",
  category_id: "раздел",
  created: "создание",
};

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  const changes = await getChangeLogForProduct(id);

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] text-muted transition-colors hover:text-text"
      >
        <ArrowLeft size={13} /> Все товары
      </Link>

      <PageHeader
        title={product.name}
        description={
          <>
            {product.onec_id
              ? <>GUID 1С: <span className="tnum">{product.onec_id}</span></>
              : "Создан вручную в админке — в 1С такого GUID нет"}
            {product.article ? <> · артикул {product.article}</> : null}
          </>
        }
        help="Всё, что здесь сохранено, сразу видно покупателю. Импорт из 1С найдёт этот товар по GUID (onec_id), а не по названию, поэтому переименование карточки ничего не ломает. Защищённые поля выгрузка не трогает, остаток — всегда обновляет."
        actions={
          product.is_visible ? (
            <Link
              href={`/catalog/${product.slug}`}
              target="_blank"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-[13px] transition-colors hover:border-accent hover:text-accent-ink"
            >
              <ExternalLink size={14} /> Как видит покупатель
            </Link>
          ) : null
        }
      />

      <ProductForm product={product} />

      <h2 className="mb-3 mt-9 flex items-center gap-2 font-display text-[15px] font-semibold">История изменений</h2>
      <Panel>
        <Table head={["Когда", "Поле", "Было", "Стало", "Кто и почему"]}>
          {changes.length === 0 && <EmptyRow colSpan={5}>Пока никто ничего не менял.</EmptyRow>}
          {changes.map((c, i) => {
            const row = c as Record<string, unknown>;
            const field = String(row.field);
            return (
              <tr key={i}>
                <td className="tnum whitespace-nowrap px-4 py-2.5 text-muted">
                  {new Date(String(row.created_at)).toLocaleString("ru-RU")}
                </td>
                <td className="px-4 py-2.5">{FIELD_LABEL[field] ?? field}</td>
                <td className="px-4 py-2.5 text-muted">{truncate(row.old_value)}</td>
                <td className="px-4 py-2.5">{truncate(row.new_value)}</td>
                <td className="px-4 py-2.5 text-muted">
                  {String(row.actor)} · {REASON_LABEL[String(row.reason)] ?? String(row.reason)}
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}

function truncate(value: unknown): string {
  const s = value === null || value === undefined ? "—" : String(value);
  return s.length > 60 ? `${s.slice(0, 60)}…` : s;
}
