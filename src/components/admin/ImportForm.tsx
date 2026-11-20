"use client";
import { useState } from "react";
import { FileUp, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ImportSummary } from "@/server/import/run";
import { uploadImport } from "@/app/admin/(dashboard)/import/actions";
import { cn } from "@/lib/cn";

export function ImportForm() {
  const [pending, setPending] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [result, setResult] = useState<ImportSummary | null>(null);

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setResult(null);
          const summary = await uploadImport(new FormData(e.currentTarget));
          setResult(summary);
          setPending(false);
        }}
      >
        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line-strong bg-sunk/50 px-5 py-8 text-center transition-colors",
            "hover:border-accent hover:bg-accent-soft/50",
          )}
        >
          <FileUp size={22} className="text-faint" />
          <span className="text-[13.5px] font-medium">
            {filename ?? "Выберите CSV-файл выгрузки"}
          </span>
          <span className="text-[12px] text-muted">UTF-8, первая строка — заголовки колонок</span>
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="hidden"
            onChange={(e) => setFilename(e.target.files?.[0]?.name ?? null)}
          />
        </label>

        <Button type="submit" disabled={pending} className="mt-4">
          {pending ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Импортируем
            </>
          ) : (
            "Загрузить и применить"
          )}
        </Button>
      </form>

      {result && (
        <div
          className={cn(
            "mt-4 rounded-md border p-4 text-[13px]",
            result.status === "ok"
              ? "border-ok/25 bg-ok-soft"
              : result.status === "partial"
                ? "border-warn/25 bg-warn-soft"
                : "border-bad/25 bg-bad-soft",
          )}
        >
          <p className="flex items-center gap-2 font-medium">
            {result.status === "ok" ? (
              <>
                <CheckCircle2 size={16} className="text-ok" /> Импорт прошёл
              </>
            ) : result.status === "partial" ? (
              <>
                <AlertTriangle size={16} className="text-warn" /> Импорт прошёл частично
              </>
            ) : (
              <>
                <AlertTriangle size={16} className="text-bad" /> Импорт не выполнен — каталог не изменился
              </>
            )}
          </p>
          <p className="tnum mt-2 text-muted">
            строк: {result.rowsTotal} · создано: {result.rowsCreated} · обновлено: {result.rowsUpdated} ·
            без изменений: {result.rowsSkipped} · ошибок: {result.rowsErrored}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[12.5px] text-muted">
              {result.errors.slice(0, 10).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
              {result.errors.length > 10 && <li>…и ещё {result.errors.length - 10}</li>}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
