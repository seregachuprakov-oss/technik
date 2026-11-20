import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "dark" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const BASE =
  "relative inline-flex select-none items-center justify-center gap-2 rounded-md font-medium " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-[180ms] ease-[var(--ease-snap)] " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-45";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-s1 hover:bg-accent-hover hover:shadow-s2",
  dark: "bg-ink text-white hover:bg-ink-3",
  outline:
    "border border-line-strong bg-card text-text hover:border-accent hover:text-accent-ink",
  ghost: "text-muted hover:bg-sunk hover:text-text",
  danger: "border border-bad/30 bg-bad-soft text-bad hover:border-bad/60",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[15px]",
};

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  href?: string;
};

export function Button({ variant = "primary", size = "md", className, href, ...props }: Props) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);
  if (href) {
    const external = href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");
    // onClick на ссылке нужен, например, чтобы закрыть выдвижную корзину
    // при переходе на оформление — иначе панель останется поверх страницы.
    const onClick = props.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement> | undefined;
    if (external) {
      return (
        <a href={href} className={classes} onClick={onClick}>
          {props.children as React.ReactNode}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {props.children as React.ReactNode}
      </Link>
    );
  }
  return <button className={classes} {...props} />;
}
