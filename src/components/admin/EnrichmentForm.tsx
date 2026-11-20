"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Input";
import type { EnrichmentDraft } from "@/server/enrichment/types";
import { generateDraftAction } from "@/app/admin/(dashboard)/enrichment/actions";

interface ProductOption { id: string; name: string; onec_id: string | null; article: string | null; is_demo: boolean }

export function EnrichmentForm({ products }: { products: ProductOption[] }) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<EnrichmentDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <form
        className="max-w-xl space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setError(null);
          setResult(null);
          try {
            const draft = await generateDraftAction(new FormData(e.currentTarget));
            setResult(draft);
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          } finally {
            setPending(false);
          }
        }}
      >
        <label className="block text-sm text-[var(--color-muted)]">
          Товар (по article/onec_id — identity никогда не по названию)
          <Select name="product_id" required className="mt-1">
            <option value="">— выберите товар —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.is_demo ? "[ДЕМО] " : ""}{p.name}{p.article ? ` · ${p.article}` : ""}
              </option>
            ))}
          </Select>
        </label>

        <label className="block text-sm text-[var(--color-muted)]">
          Источник (необязательно) — вставьте сюда текст или ссылку, которую сами проверили.
          AI НИКОГДА не ходит в интернет сам — только то, что уже есть в карточке товара плюс это поле.
          <Textarea name="source_note" rows={4} className="mt-1" placeholder="Например, текст со страницы производителя, который вы сами открыли и скопировали сюда" />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="generate_image" defaultChecked className="accent-[var(--color-accent)]" />
          Также сгенерировать иллюстративное фото (Gemini, оригинальная иллюстрация, не фото конкретного товара)
        </label>

        <Button type="submit" disabled={pending}>{pending ? "Генерируем черновик..." : "Сгенерировать черновик"}</Button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-sm text-red-300">{error}</div>
      )}

      {result && (
        <div className="mt-6 max-w-xl rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-sm">
          <p className="font-medium">Черновик создан — ждёт подтверждения ниже в списке «На проверке».</p>
          <p className="mt-2 whitespace-pre-wrap text-[var(--color-text)]">{result.draft_description}</p>
          {result.draft_image_path && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={result.draft_image_path} alt="AI-иллюстрация товара" className="mt-3 w-40 rounded-lg border border-[var(--color-line)]" />
          )}
          {result.draft_image_error && (
            <p className="mt-2 text-xs text-amber-300">Фото не сгенерировано: {result.draft_image_error}</p>
          )}
          {result.cross_check_warnings.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-amber-300">
              {result.cross_check_warnings.map((w, i) => <li key={i}>{w.note}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
