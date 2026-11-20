"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Подсказка «?» рядом с заголовком раздела или полем в админке.
 * Открывается по наведению, по фокусу с клавиатуры и по тапу на телефоне
 * (на тач-устройстве hover не существует, поэтому состояние общее и
 * закрывается по Esc, по клику вне и по уходу курсора).
 *
 * Текст подсказки пишется под конкретное поле: что это, что увидит
 * покупатель и что сломается, если сделать неправильно. Общих фраз
 * вроде «введите значение» здесь быть не должно.
 */
export function HelpTooltip({
  children,
  title,
  side = "right",
  className,
}: {
  children: React.ReactNode;
  title?: string;
  side?: "right" | "left" | "top";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  // На телефоне подсказка — это нижняя плашка во всю ширину экрана: всплывающее
  // окно шириной 288px, привязанное к значку, неизбежно уезжает за правый край
  // и даёт горизонтальную прокрутку. С планшета и шире — обычный поповер у значка.
  const pos =
    side === "left"
      ? "sm:bottom-auto sm:left-auto sm:right-full sm:top-1/2 sm:mr-2 sm:-translate-y-1/2"
      : side === "top"
        ? "sm:bottom-full sm:left-1/2 sm:top-auto sm:mb-2 sm:-translate-x-1/2"
        : "sm:left-full sm:top-1/2 sm:ml-2 sm:-translate-y-1/2";

  return (
    <span ref={wrapRef} className={cn("relative inline-flex align-middle", className)}>
      <button
        type="button"
        aria-label={title ? `Подсказка: ${title}` : "Подсказка"}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={cn(
          "inline-flex size-[18px] items-center justify-center rounded-full border text-faint transition-colors duration-[120ms]",
          open ? "border-accent bg-accent-soft text-accent-ink" : "border-line-strong hover:border-accent hover:text-accent-ink",
        )}
      >
        <HelpCircle size={12} strokeWidth={2.4} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 2, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.2, 0.9, 0.1, 1] }}
            className={cn(
              "fixed inset-x-3 bottom-3 z-50 rounded-md border border-line bg-card p-3.5 text-left text-xs leading-relaxed font-normal normal-case tracking-normal text-muted shadow-s3",
              "sm:absolute sm:inset-x-auto sm:bottom-auto sm:w-72 sm:p-3",
              pos,
            )}
          >
            {title && <span className="mb-1 block text-[13px] font-semibold text-text">{title}</span>}
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Заголовок раздела админки со встроенной подсказкой. */
export function SectionTitle({
  children,
  help,
  helpTitle,
  level = 2,
  className,
}: {
  children: React.ReactNode;
  help?: React.ReactNode;
  helpTitle?: string;
  level?: 1 | 2 | 3;
  className?: string;
}) {
  const Tag = (level === 1 ? "h1" : level === 2 ? "h2" : "h3") as "h1";
  const size = level === 1 ? "text-2xl" : level === 2 ? "text-lg" : "text-[15px]";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Tag className={cn("font-display font-semibold", size)}>{children}</Tag>
      {help && (
        <HelpTooltip title={helpTitle} side="right">
          {help}
        </HelpTooltip>
      )}
    </div>
  );
}
