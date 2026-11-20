"use client";
import { useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { kopecksToRub } from "@/lib/money";
import type { Product } from "@/server/catalog";
import { updateProduct } from "@/app/admin/(dashboard)/products/[id]/actions";

const OVERRIDE_LABELS: Record<string, string> = { name: "Название", description: "Описание", price: "Цена" };

export function ProductForm({ product }: { product: Product }) {
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        await updateProduct(product.id, new FormData(e.currentTarget));
        setPending(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }}
    >
      <label className="block text-sm text-[var(--color-muted)]">
        Название
        <Input name="name" defaultValue={product.name} required className="mt-1" />
      </label>
      <label className="block text-sm text-[var(--color-muted)]">
        Описание
        <Textarea name="description" defaultValue={product.description} rows={4} className="mt-1" />
      </label>
      <label className="block text-sm text-[var(--color-muted)]">
        Цена, ₽
        <Input name="price" type="number" step="0.01" defaultValue={kopecksToRub(product.price_kopecks)} required className="mt-1" />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_visible" defaultChecked={product.is_visible} className="accent-[var(--color-accent)]" />
        Показывать в каталоге
      </label>

      <div className="rounded-xl border border-[var(--color-line)] p-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="manual_override" defaultChecked={product.manual_override} className="accent-[var(--color-accent)]" />
          Ручная правка (импорт из 1С не будет менять этот товар, кроме остатка)
        </label>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Остаток и наличие всегда обновляются из 1С — это физический склад. Ниже можно защитить отдельные поля
          даже без полной ручной правки.
        </p>
        <div className="mt-3 space-y-2">
          {Object.entries(OVERRIDE_LABELS).map(([field, label]) => (
            <label key={field} className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <input type="checkbox" name={`override_${field}`} defaultChecked={product.manual_override || product.overridden_fields.includes(field)} className="accent-[var(--color-accent)]" />
              Защитить «{label}» от импорта
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Сохраняем..." : saved ? "Сохранено ✓" : "Сохранить"}
      </Button>
    </form>
  );
}
