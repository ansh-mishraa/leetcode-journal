import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  backHref,
  backLabel,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-8", className)}>
      {backHref ? (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {backLabel ?? "Back"}
        </Link>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-muted">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2.5 text-sm leading-relaxed text-muted md:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div
        className="mt-6 h-px w-full"
        aria-hidden
        style={{
          background:
            "linear-gradient(90deg, color-mix(in srgb, var(--band-expert) 40%, transparent), var(--rule) 35%, transparent)",
        }}
      />
    </div>
  );
}
