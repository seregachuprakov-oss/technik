"use client";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { ImageUploadField } from "./ImageUploadField";
import { kopecksToRub } from "@/lib/money";
import type { Product } from "@/server/catalog";
import { updateProduct } from "@/app/admin/(dashboard)/products/[id]/actions";

const OVERRIDE_FIELDS: { field: string; label: string; help: string }[] = [
  {
    field: "name",
    label: "Название",
    help: "Если в 1С название записано как «Пистолет термокл. 7мм 190C», а на сайте вы написали по-человечески — поставьте галочку, иначе следующая выгрузка вернёт сокращения.",
  },
  {
    field: "description",
    label: "Описание",
    help: "Защищает текст, который вы написали руками. В выгрузке из 1С описание часто пустое, и без защиты оно затрётся пустотой.",
  },
  {
    field: "price",
    label: "Цена",
    help: "Ставьте только если на сайте сознательно другая цена, чем в 1С. В обычной ситуации цену лучше оставить незащищённой: тогда она едет из кассы и на сайте не будет устаревшей.",
  },
];

export function ProductForm({ product }: { product: Product }) {
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-5">
      <ImageUploadField productId={product.id} initialPath={product.image_path} />

      <form
        className="space-y-5 rounded-md border border-line bg-card p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          await updateProduct(product.id, new FormData(e.currentTarget));
          setPending(false);
          setSaved(true);
          setTimeout(() => setSaved(false), 2200);
        }}
      >
        <Field
          label={
            <>
              Название
              <HelpTooltip title="Название">
                Ровно то, что покупатель увидит в каталоге и в поиске. Пишите так, как спросят
                в магазине: тип инструмента, главный размер, мощность. Аббревиатуры из 1С
                («пист. термокл.») лучше расшифровать.
              </HelpTooltip>
            </>
          }
          htmlFor="pf-name"
        >
          <Input id="pf-name" name="name" defaultValue={product.name} required />
        </Field>

        <Field
          label={
            <>
              Описание
              <HelpTooltip title="Описание">
                Короткий абзац о том, для чего вещь и чем отличается от соседней на полке.
                Характеристики (диаметр, мощность, тип скобы) приходят из 1С отдельным блоком —
                дублировать их здесь не нужно.
              </HelpTooltip>
            </>
          }
          htmlFor="pf-desc"
        >
          <Textarea id="pf-desc" name="description" defaultValue={product.description} rows={4} />
        </Field>

        <Field
          label={
            <>
              Цена, ₽
              <HelpTooltip title="Цена">
                Это та цена, которую видит покупатель на сайте и называет по телефону. Вводится
                в рублях, в базе хранится в копейках. После сохранения цена помечается как
                подтверждённая человеком, и с карточки пропадает приписка «цена ориентировочная».
              </HelpTooltip>
            </>
          }
          htmlFor="pf-price"
        >
          <Input
            id="pf-price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={kopecksToRub(product.price_kopecks)}
            required
            className="tnum max-w-44"
          />
        </Field>

        <label className="flex items-center gap-2.5 text-[13.5px]">
          <input
            type="checkbox"
            name="is_visible"
            defaultChecked={product.is_visible}
            className="size-4 accent-[var(--color-accent)]"
          />
          Показывать в каталоге
          <HelpTooltip title="Видимость">
            Снятая галочка убирает карточку с сайта полностью — её не будет ни в каталоге, ни по
            прямой ссылке. Это не то же самое, что «нет в наличии»: отсутствующий товар остаётся
            виден с пометкой и кнопкой «уточнить наличие», и его продолжают искать.
          </HelpTooltip>
        </label>

        <fieldset className="rounded-md border border-line bg-sunk/50 p-4">
          <legend className="flex items-center gap-2 px-1 text-[13px] font-medium">
            Защита от импорта
            <HelpTooltip title="Защита от импорта">
              Импорт узнаёт товар по onec_id — GUID номенклатуры из 1С, а не по названию или
              артикулу. Поэтому ваши правки не «теряются» между выгрузками: они остаются на том же
              товаре. Но без защиты выгрузка перезапишет поля значениями из 1С. Остаток и наличие
              защитить нельзя никогда: это физический склад, и на сайте не должно быть «в наличии»
              того, чего нет на полке.
            </HelpTooltip>
          </legend>

          <label className="flex items-start gap-2.5 text-[13.5px]">
            <input
              type="checkbox"
              name="manual_override"
              defaultChecked={product.manual_override}
              className="mt-0.5 size-4 accent-[var(--color-accent)]"
            />
            <span>
              Карточка ведётся вручную
              <span className="mt-0.5 block text-[12px] text-muted">
                Импорт не меняет у неё ничего, кроме остатка. Подходит для товаров, которых в 1С
                нет или где номенклатура заполнена небрежно.
              </span>
            </span>
          </label>

          <div className="mt-3 space-y-2 border-t border-line pt-3">
            {OVERRIDE_FIELDS.map(({ field, label, help }) => (
              <label key={field} className="flex items-center gap-2.5 text-[13px] text-muted">
                <input
                  type="checkbox"
                  name={`override_${field}`}
                  defaultChecked={product.manual_override || product.overridden_fields.includes(field)}
                  className="size-4 accent-[var(--color-accent)]"
                />
                Защитить «{label}»
                <HelpTooltip title={`Защита поля «${label}»`}>{help}</HelpTooltip>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center gap-3 border-t border-line pt-4">
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Сохраняем
              </>
            ) : saved ? (
              <>
                <Check size={15} /> Сохранено
              </>
            ) : (
              "Сохранить"
            )}
          </Button>
          <span className="text-[12px] text-muted">Каждое изменение попадает в журнал ниже.</span>
        </div>
      </form>
    </div>
  );
}
