"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Trash2, Loader2, ImageIcon, AlertCircle } from "lucide-react";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { uploadProductImage, removeProductImage } from "@/app/admin/(dashboard)/products/[id]/actions";
import { cn } from "@/lib/cn";

/**
 * Загрузка фото товара. Превью показывается сразу из выбранного файла
 * (URL.createObjectURL), не дожидаясь ответа сервера, — иначе на мобильном
 * интернете сотрудник несколько секунд смотрит в пустоту и жмёт кнопку второй раз.
 */
export function ImageUploadField({
  productId,
  initialPath,
}: {
  productId: string;
  initialPath: string | null;
}) {
  const [path, setPath] = useState(initialPath);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isUploaded = Boolean(path?.startsWith("/uploads/"));
  const shown = preview ?? path;

  async function send(file: File) {
    setError(null);
    setPreview(URL.createObjectURL(file));
    setPending(true);
    const fd = new FormData();
    fd.set("image", file);
    const result = await uploadProductImage(productId, fd);
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Не удалось загрузить");
      setPreview(null);
      return;
    }
    setPath(result.imagePath ?? null);
    setPreview(null);
  }

  return (
    <div className="rounded-md border border-line bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium">Фото товара</span>
        <HelpTooltip title="Фото товара">
          Снимок с телефона подойдёт: сервер сам повернёт его по EXIF, уменьшит до 1400 px и
          пережмёт в WebP. Пока своего фото нет, в карточке стоит сгенерированная иллюстрация
          с подписью «Фото иллюстративное» — ваш снимок эту подпись убирает, потому что
          покупатель видит реальный товар. Фото не перезаписывается выгрузкой из 1С и
          переживает обновление сайта.
        </HelpTooltip>
      </div>

      <div className="mt-3 flex flex-wrap items-start gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void send(file);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative grid size-36 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-md border border-dashed bg-sunk transition-colors",
            dragging ? "border-accent bg-accent-soft" : "border-line-strong hover:border-accent",
          )}
        >
          {shown ? (
            <Image src={shown} alt="Фото товара" fill sizes="144px" className="object-cover" unoptimized={Boolean(preview)} />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-faint">
              <ImageIcon size={22} strokeWidth={1.6} />
              <span className="text-[11px]">перетащите файл</span>
            </div>
          )}
          {pending && (
            <div className="absolute inset-0 grid place-items-center bg-ink/55 text-white">
              <Loader2 size={20} className="animate-spin" />
            </div>
          )}
        </div>

        <div className="min-w-48 flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void send(file);
              e.target.value = "";
            }}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={pending}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-line-strong px-3 text-[13px] font-medium transition-colors hover:border-accent hover:text-accent-ink disabled:opacity-50"
            >
              <Upload size={14} /> {isUploaded ? "Заменить фото" : "Загрузить фото"}
            </button>

            {path && (
              <button
                type="button"
                disabled={pending}
                onClick={async () => {
                  setPending(true);
                  const r = await removeProductImage(productId);
                  setPending(false);
                  if (r.ok) setPath(null);
                  else setError(r.error ?? "Не удалось убрать фото");
                }}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-[13px] text-muted transition-colors hover:border-bad hover:text-bad disabled:opacity-50"
              >
                <Trash2 size={14} /> Убрать
              </button>
            )}
          </div>

          <p className="text-[12px] leading-relaxed text-muted">
            {isUploaded
              ? "Сейчас стоит ваше фото — подписи «Фото иллюстративное» на сайте нет."
              : path
                ? "Сейчас стоит сгенерированная иллюстрация: на сайте под ней подпись «Фото иллюстративное»."
                : "Фото нет — в каталоге рисуется техническая заглушка."}
          </p>

          {error && (
            <p className="flex items-start gap-1.5 text-[12px] text-bad">
              <AlertCircle size={13} className="mt-px shrink-0" /> {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
