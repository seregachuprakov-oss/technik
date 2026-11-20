"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ImportSummary } from "@/server/import/run";
import { uploadImport } from "@/app/admin/(dashboard)/import/actions";

export function ImportForm() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ImportSummary | null>(null);

  return (
    <div>
      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setResult(null);
          const summary = await uploadImport(new FormData(e.currentTarget));
          setResult(summary);
          setPending(false);
        }}
      >
        <input type="file" name="file" accept=".csv" required className="text-sm text-[var(--color-muted)]" />
        <Button type="submit" disabled={pending}>{pending ? "Импортируем..." : "Загрузить файл"}</Button>
      </form>

      {result && (
        <div className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-sm">
          <p>
            Статус: <strong>{result.status}</strong> · строк: {result.rowsTotal} · создано: {result.rowsCreated} ·
            обновлено: {result.rowsUpdated} · без изменений: {result.rowsSkipped} · ошибок: {result.rowsErrored}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-[var(--color-muted)]">
              {result.errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
