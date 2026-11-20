import { cn } from "@/lib/cn";

/**
 * Инлайн-SVG вордмарк «Техник»: геометрический "Т", собранный из трёх
 * прямых линий как инструмент (отвёртка/уровень), плюс буквенная часть.
 * Без внешней генерации изображений — чистая геометрия, премиальная подача.
 */
export function Logo({ className, mono = false }: { className?: string; mono?: boolean }) {
  return (
    <svg
      viewBox="0 0 220 48"
      className={cn("h-8 w-auto", className)}
      role="img"
      aria-label="Техник"
    >
      <g>
        <rect x="0" y="4" width="40" height="8" rx="1" fill={mono ? "currentColor" : "var(--color-accent)"} />
        <rect x="16" y="4" width="8" height="40" rx="1" fill={mono ? "currentColor" : "var(--color-accent)"} />
      </g>
      <text
        x="52"
        y="34"
        fontFamily="var(--font-display), system-ui, sans-serif"
        fontWeight="700"
        fontSize="30"
        letterSpacing="0.2"
        fill="currentColor"
      >
        Техник
      </text>
    </svg>
  );
}
