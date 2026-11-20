import { cn } from "@/lib/cn";
import { HelpTooltip } from "@/components/ui/HelpTooltip";

export function PageHeader({
  title,
  description,
  help,
  helpTitle,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  help?: React.ReactNode;
  helpTitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-[26px] font-semibold leading-tight">{title}</h1>
          {help && <HelpTooltip title={helpTitle ?? title}>{help}</HelpTooltip>}
        </div>
        {description && <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Panel({
  title,
  help,
  helpTitle,
  children,
  className,
  footer,
}: {
  title?: string;
  help?: React.ReactNode;
  helpTitle?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}) {
  return (
    <section className={cn("overflow-hidden rounded-lg border border-line bg-card", className)}>
      {title && (
        <header className="flex items-center gap-2 border-b border-line px-4 py-3">
          <h2 className="font-display text-[14px] font-semibold">{title}</h2>
          {help && <HelpTooltip title={helpTitle ?? title}>{help}</HelpTooltip>}
        </header>
      )}
      {children}
      {footer && <div className="border-t border-line px-4 py-3 text-[12px] text-muted">{footer}</div>}
    </section>
  );
}

export function Table({ head, children }: { head: React.ReactNode[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-[13px]">
        <thead>
          <tr className="border-b border-line bg-sunk/60 text-left">
            {head.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-faint">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-[13px] text-muted">
        {children}
      </td>
    </tr>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: "ok" | "bad" | "warn" | "neutral";
  children: React.ReactNode;
}) {
  const tones = {
    ok: "bg-ok-soft text-ok",
    bad: "bg-bad-soft text-bad",
    warn: "bg-warn-soft text-warn",
    neutral: "bg-sunk text-muted",
  } as const;
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-xs px-2 py-0.5 text-[11.5px] font-medium", tones[tone])}>
      {children}
    </span>
  );
}
