import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} aria-hidden />;
}

/** Standard page-loading shell so routes never flash blank. */
export function PageSkeleton({
  rows = 3,
  withHeader = true,
}: {
  rows?: number;
  withHeader?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8" role="status" aria-label="Loading">
      {withHeader ? (
        <div className="mb-8 space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
      ) : null}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
