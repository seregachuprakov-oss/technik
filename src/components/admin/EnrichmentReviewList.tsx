"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { EnrichmentDraft } from "@/server/enrichment/types";
import { approveDraftAction, rejectDraftAction } from "@/app/admin/(dashboard)/enrichment/actions";

type DraftRow = EnrichmentDraft & { product_name: string; is_demo?: boolean };

export function EnrichmentReviewList({ drafts }: { drafts: DraftRow[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<Record<string, string>>({});

  if (drafts.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">Черновиков пока нет.</p>;
  }

  return (
    <div className="space-y-4">
      {drafts.map((d) => {
        const status = localStatus[d.id] ?? d.status;
        return (
          <div key={d.id} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">
                {d.is_demo ? "[ДЕМО] " : ""}{d.product_name}
              </p>
              <span className={
                status === "approved" ? "text-emerald-300" : status === "rejected" ? "text-red-300" : "text-amber-300"
              }>
                {status === "approved" ? "одобрено" : status === "rejected" ? "отклонено" : "на проверке"}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-[var(--color-text)]">{d.draft_description}</p>
            {d.draft_image_path && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.draft_image_path} alt="AI-иллюстрация товара" className="mt-3 w-32 rounded-lg border border-[var(--color-line)]" />
            )}
            {d.source_note && (
              <p className="mt-2 text-xs text-[var(--color-muted)]">Источник сотрудника: {d.source_note}</p>
            )}
            {d.cross_check_warnings.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-300">
                {d.cross_check_warnings.map((w, i) => <li key={i}>{w.note}</li>)}
              </ul>
            )}
            {status === "pending_review" && (
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  disabled={busyId === d.id}
                  onClick={async () => {
                    setBusyId(d.id);
                    await approveDraftAction(d.id);
                    setLocalStatus((s) => ({ ...s, [d.id]: "approved" }));
                    setBusyId(null);
                  }}
                >
                  Одобрить и опубликовать
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busyId === d.id}
                  onClick={async () => {
                    setBusyId(d.id);
                    await rejectDraftAction(d.id);
                    setLocalStatus((s) => ({ ...s, [d.id]: "rejected" }));
                    setBusyId(null);
                  }}
                >
                  Отклонить
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
