import Link from "next/link";
import { AlertTriangle, Package, ShoppingBag, MessageSquare, ArrowRight } from "lucide-react";
import { queryOne } from "@/server/db";
import { PageHeader } from "@/components/admin/ui";
import { HelpTooltip } from "@/components/ui/HelpTooltip";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [productsCount, visibleCount, pendingOrders, newLeads, lastImport] = await Promise.all([
    queryOne<{ count: number }>(`SELECT count(*)::int AS count FROM products`),
    queryOne<{ count: number }>(`SELECT count(*)::int AS count FROM products WHERE is_visible AND is_available`),
    queryOne<{ count: number }>(`SELECT count(*)::int AS count FROM orders WHERE status = 'pending_confirmation'`),
    queryOne<{ count: number }>(`SELECT count(*)::int AS count FROM leads WHERE status = 'new'`),
    queryOne<{ finished_at: string | null; status: string }>(
      `SELECT finished_at, status FROM import_runs ORDER BY started_at DESC LIMIT 1`,
    ),
  ]);

  const staleHours = Number(process.env.IMPORT_STALE_HOURS ?? 72);
  const hoursSinceImport = lastImport?.finished_at
    ? (Date.now() - new Date(lastImport.finished_at).getTime()) / 3_600_000
    : null;
  const isStale = hoursSinceImport === null || hoursSinceImport > staleHours || lastImport?.status === "failed";

  return (
    <div>
      <PageHeader
        title="Обзор"
        description="Что требует внимания прямо сейчас: несвежие остатки, неподтверждённые заказы, необработанные заявки."
      />

      {isStale && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-warn/30 bg-warn-soft p-4">
          <AlertTriangle size={18} className="mt-px shrink-0 text-warn" />
          <div className="text-[13px] leading-relaxed text-warn">
            <p className="font-medium">
              {lastImport
                ? lastImport.status === "failed"
                  ? "Последний импорт остатков упал"
                  : `Остатки не обновлялись ${hoursSinceImport !== null ? `${Math.round(hoursSinceImport)} ч` : "давно"}`
                : "Импорт из 1С ещё ни разу не запускался"}
            </p>
            <p className="mt-1">
              Порог свежести — {staleHours} ч. Пока выгрузки нет, в каталоге может висеть «в наличии»
              у того, что уже продано.{" "}
              <Link href="/admin/import" className="font-medium underline underline-offset-4">
                Загрузить выгрузку
              </Link>
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Товаров в каталоге"
          value={productsCount?.count ?? 0}
          note={`${visibleCount?.count ?? 0} видно и в наличии`}
          icon={Package}
          href="/admin/products"
          help="Сколько карточек вообще заведено в базе. Вторая строка — сколько из них покупатель реально видит в каталоге как доступные к покупке."
        />
        <StatCard
          label="Заказов ждёт звонка"
          value={pendingOrders?.count ?? 0}
          note="статус «ожидает подтверждения»"
          icon={ShoppingBag}
          href="/admin/orders"
          help="Заказы с сайта не уходят в кассу сами. Пока менеджер не позвонил и не подтвердил состав, заказ висит здесь, а покупатель ждёт."
        />
        <StatCard
          label="Новых заявок"
          value={newLeads?.count ?? 0}
          note="прокат и вопросы"
          icon={MessageSquare}
          href="/admin/leads"
          help="Заявки из формы проката. Боты в Telegram/VK не подключены, уведомления на почту приходят только если в .env.local заполнен SMTP — иначе эта страница единственное место, где их видно."
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  href,
  help,
}: {
  label: string;
  value: number;
  note: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
  help: string;
}) {
  return (
    <div className="group relative rounded-lg border border-line bg-card p-5 transition-[box-shadow,border-color] duration-[180ms] hover:border-line-strong hover:shadow-s1">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5 text-[12.5px] text-muted">
          {label}
          <HelpTooltip title={label} side="top">{help}</HelpTooltip>
        </div>
        <Icon size={16} className="text-faint" />
      </div>
      <div className="tnum mt-3 font-display text-[30px] font-semibold leading-none">{value}</div>
      <div className="mt-1.5 text-[12px] text-faint">{note}</div>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent-ink after:absolute after:inset-0"
      >
        Открыть
        <ArrowRight size={13} className="transition-transform duration-[260ms] group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
