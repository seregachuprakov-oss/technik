import Link from "next/link";
import { query, queryOne } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [productsCount, pendingOrders, newLeads, lastImport] = await Promise.all([
    queryOne<{ count: string }>(`SELECT count(*)::int AS count FROM products`),
    queryOne<{ count: string }>(`SELECT count(*)::int AS count FROM orders WHERE status = 'pending_confirmation'`),
    queryOne<{ count: string }>(`SELECT count(*)::int AS count FROM leads WHERE status = 'new'`),
    queryOne<{ finished_at: string | null; status: string }>(`SELECT finished_at, status FROM import_runs ORDER BY started_at DESC LIMIT 1`),
  ]);

  const staleHours = Number(process.env.IMPORT_STALE_HOURS ?? 72);
  const hoursSinceImport = lastImport?.finished_at
    ? (Date.now() - new Date(lastImport.finished_at).getTime()) / 3_600_000
    : null;
  const isStale = hoursSinceImport === null || hoursSinceImport > staleHours || lastImport?.status === "failed";

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Обзор</h1>

      {isStale && (
        <div className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          {lastImport ? (
            <>
              Последний импорт остатков из 1С — {lastImport.status === "failed" ? "упал" : "был"} {hoursSinceImport !== null ? `${Math.round(hoursSinceImport)} ч назад` : ""},
              порог свежести {staleHours} ч. Остатки на сайте могут не отражать реальный склад.
            </>
          ) : (
            "Импорт из 1С ещё не запускался — на сайте нет реальных остатков."
          )}{" "}
          <Link href="/admin/import" className="underline">Запустить импорт</Link>
        </div>
      )}

      <div className="mt-8 grid grid-cols-3 gap-4">
        <StatCard label="Товаров в каталоге" value={productsCount?.count ?? "0"} />
        <StatCard label="Заказов ждёт подтверждения" value={pendingOrders?.count ?? "0"} href="/admin/orders" />
        <StatCard label="Новых заявок" value={newLeads?.count ?? "0"} href="/admin/leads" />
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
      <p className="text-sm text-[var(--color-muted)]">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
