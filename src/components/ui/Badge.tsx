import { cn } from "@/lib/cn";

type Tone = "neutral" | "ok" | "bad" | "warn" | "accent";

const TONES: Record<Tone, string> = {
  neutral: "bg-sunk text-muted",
  ok: "bg-ok-soft text-ok",
  bad: "bg-bad-soft text-bad",
  warn: "bg-warn-soft text-warn",
  accent: "bg-accent-soft text-accent-ink",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs px-2 py-1 text-[11px] font-medium uppercase tracking-[0.06em]",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Точка-индикатор наличия: читается без цвета по форме подписи рядом. */
export function StockDot({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-1.5 rounded-full", ok ? "bg-ok" : "bg-bad")}
    />
  );
}
