import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "outline";

const BASE = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition disabled:opacity-50 disabled:pointer-events-none";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-[var(--color-accent)] text-black hover:brightness-110",
  outline: "border border-[var(--color-line)] text-[var(--color-text)] hover:border-[var(--color-accent)]",
  ghost: "text-[var(--color-text)] hover:bg-[var(--color-surface-2)]",
};

export function Button({
  variant = "primary",
  className,
  href,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; href?: string }) {
  const classes = cn(BASE, VARIANTS[variant], className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {props.children as React.ReactNode}
      </Link>
    );
  }
  return <button className={classes} {...props} />;
}
