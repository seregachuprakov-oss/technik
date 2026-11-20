import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-sm", className)} />;
}

/** Карточка-заглушка каталога: та же сетка, что у настоящей, без «прыжка» вёрстки. */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border border-line bg-card p-3">
      <Skeleton className="aspect-4/3 w-full rounded-md" />
      <div className="mt-4 space-y-2 px-1 pb-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </div>
  );
}
