import Link from "next/link";
import { query } from "@/server/db";
import { formatRub } from "@/lib/money";
import { PageHeader, Panel, Table, EmptyRow, StatusPill } from "@/components/admin/ui";

interface Row {
  id: string; name: string; price_kopecks: number; stock_qty: number; is_available: boolean;
  is_visible: boolean; manual_override: boolean; category_name: string | null; onec_id: string | null;
  image_path: string | null;
}

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await query<Row>(
    `SELECT p.id, p.name, p.price_kopecks, p.stock_qty, p.is_available, p.is_visible,
            p.manual_override, p.onec_id, p.image_path, c.name AS category_name
     FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.sort, p.name`,
  );

  return (
    <div>
      <PageHeader
        title="Товары"
        description="Карточки каталога: цена, остаток, видимость на сайте. Остаток приходит из 1С и руками здесь не меняется."
        help="Товары попадают сюда двумя путями: выгрузкой из 1С (у них есть GUID номенклатуры) и вручную. Нажмите «изменить», чтобы поправить название, описание, цену, загрузить фото и защитить поля от перезаписи следующей выгрузкой."
      />

      <Panel>
        <Table head={["Название", "Раздел", "Цена", "Остаток", "На сайте", "Фото", "Источник", ""]}>
          {products.length === 0 && <EmptyRow colSpan={8}>Каталог пуст — загрузите выгрузку из 1С.</EmptyRow>}
          {products.map((p) => (
            <tr key={p.id} className="transition-colors hover:bg-sunk/50">
              <td className="px-4 py-2.5 font-medium">{p.name}</td>
              <td className="px-4 py-2.5 text-muted">{p.category_name ?? "—"}</td>
              <td className="tnum whitespace-nowrap px-4 py-2.5">{formatRub(p.price_kopecks)}</td>
              <td className="tnum px-4 py-2.5 text-muted">{p.stock_qty}</td>
              <td className="px-4 py-2.5">
                {!p.is_visible ? (
                  <StatusPill tone="neutral">скрыт</StatusPill>
                ) : p.is_available ? (
                  <StatusPill tone="ok">в наличии</StatusPill>
                ) : (
                  <StatusPill tone="bad">нет на полке</StatusPill>
                )}
              </td>
              <td className="px-4 py-2.5 text-[12px] text-muted">
                {p.image_path?.startsWith("/uploads/")
                  ? "своё фото"
                  : p.image_path
                    ? "иллюстрация"
                    : "—"}
              </td>
              <td className="px-4 py-2.5 text-[12px]">
                {p.manual_override ? (
                  <StatusPill tone="warn">ручная правка</StatusPill>
                ) : p.onec_id?.startsWith("demo-") ? (
                  <span className="text-muted">демо-карточка</span>
                ) : p.onec_id ? (
                  <span className="text-muted">из 1С</span>
                ) : (
                  <span className="text-muted">создан в админке</span>
                )}
              </td>
              <td className="px-4 py-2.5 text-right">
                <Link href={`/admin/products/${p.id}`} className="font-medium text-accent-ink hover:underline">
                  изменить
                </Link>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
