import { cn } from "@/lib/cn";

const FIELD =
  "w-full rounded-md border border-line bg-card px-3.5 py-2.5 text-sm text-text " +
  "placeholder:text-faint outline-none transition-[border-color,box-shadow] duration-[180ms] " +
  "hover:border-line-strong focus:border-accent focus:ring-3 focus:ring-accent/15";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD, className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD, "resize-y", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(FIELD, "appearance-none pr-9", className)} {...props} />;
}

/** Подпись + поле + подсказка одним блоком, чтобы формы не разъезжались. */
export function Field({
  label,
  hint,
  children,
  htmlFor,
  className,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-[13px] font-medium text-text">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-muted">{hint}</p>}
    </div>
  );
}
