import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  href,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accent?: string;
  href?: string;
  className?: string;
}) {
  const body = (
    <>
      <div
        className="pointer-events-none absolute -right-6 -top-8 size-24 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
        style={{
          background: accent
            ? `color-mix(in srgb, ${accent} 22%, transparent)`
            : "transparent",
          opacity: accent ? 0.6 : 0,
        }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="font-data text-[10px] uppercase tracking-[0.18em] text-muted">
          {label}
        </p>
        {Icon ? (
          <Icon
            className="size-4 shrink-0"
            style={{ color: accent ?? "var(--muted)" }}
            aria-hidden
          />
        ) : null}
      </div>
      <p
        className="relative mt-2 font-data text-3xl leading-none tracking-tight"
        style={accent ? { color: accent } : undefined}
        data-numeric
      >
        {value}
      </p>
      {hint ? (
        <p className="relative mt-2 text-xs leading-relaxed text-muted">{hint}</p>
      ) : null}
    </>
  );

  const classes = cn(
    "group relative overflow-hidden rounded-2xl border border-border bg-card px-4 py-4",
    href && "surface-interactive cursor-pointer",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }

  return <div className={classes}>{body}</div>;
}
