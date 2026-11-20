import Image from "next/image";
import { Hexagon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Единственное место, где сайт решает, что показывать вместо фото товара.
 *
 * Соглашение о картинках (брендбук, раздел 6):
 *  - /uploads/...  — настоящее фото, загруженное сотрудником в админке.
 *    Подпись не нужна: это то, что лежит на полке.
 *  - любой другой путь — сгенерированная иллюстрация. Под ней обязательна
 *    плашка «Фото иллюстративное»: покупатель должен понимать, что перед ним
 *    не снимок конкретной коробки, иначе это обещание, которое магазин не давал.
 *  - пустой image_path — техничная заглушка с фирменным знаком, без
 *    серого прямоугольника «нет фото».
 *
 * Если в БД появится колонка image_is_illustrative — она главнее пути.
 */
export function isIllustrative(product: { image_path: string | null; image_is_illustrative?: boolean | null }): boolean {
  if (typeof product.image_is_illustrative === "boolean") return product.image_is_illustrative;
  if (!product.image_path) return false;
  return !product.image_path.startsWith("/uploads/");
}

export function ProductImage({
  product,
  sizes,
  priority = false,
  className,
  rounded = "rounded-md",
}: {
  product: { name: string; image_path: string | null; image_is_illustrative?: boolean | null };
  sizes: string;
  priority?: boolean;
  className?: string;
  rounded?: string;
}) {
  const illustrative = isIllustrative(product);

  return (
    <div className={cn("relative overflow-hidden bg-sunk", rounded, className)}>
      {product.image_path ? (
        <Image
          src={product.image_path}
          alt={product.name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-[420ms] ease-[var(--ease-out-quint)] group-hover:scale-[1.03]"
        />
      ) : (
        <Placeholder />
      )}

      {illustrative && (
        <span className="absolute bottom-1.5 left-1.5 rounded-xs bg-ink/72 px-1.5 py-0.5 text-[10px] font-medium tracking-[0.04em] text-white/90 backdrop-blur-[2px]">
          Фото иллюстративное
        </span>
      )}
    </div>
  );
}

function Placeholder() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(to_right,rgba(20,23,28,.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,23,28,.045)_1px,transparent_1px)] bg-[length:16px_16px]">
      <div className="flex flex-col items-center gap-1.5 text-faint">
        <Hexagon size={26} strokeWidth={1.4} />
        <span className="text-[10px] tracking-[0.08em] uppercase">фото скоро</span>
      </div>
    </div>
  );
}
