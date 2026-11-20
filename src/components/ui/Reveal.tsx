"use client";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * Появление секции при прокрутке: 14px подъёма + проявление, кривая
 * out-quint. Срабатывает один раз. При prefers-reduced-motion блок
 * просто отрисовывается на месте — без сдвига и без задержки.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const reduced = useReducedMotion();
  const M = motion[as];

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <M
      className={cn(className)}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  );
}
