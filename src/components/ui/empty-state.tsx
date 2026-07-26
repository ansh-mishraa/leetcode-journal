import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Empty screens are invitations to act — never blank space. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  accent = "var(--band-expert)",
  actions,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-dashed border-border px-6 py-14 text-center md:py-16",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-70"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 50% 100% at 50% 0%, color-mix(in srgb, ${accent} 14%, transparent), transparent 70%)`,
        }}
      />
      <div className="relative">
        <div
          className="mx-auto flex size-14 items-center justify-center rounded-2xl"
          style={{
            background: `color-mix(in srgb, ${accent} 14%, transparent)`,
            color: accent,
          }}
        >
          <Icon className="size-6" aria-hidden />
        </div>
        <h2 className="mt-5 font-display text-xl tracking-tight md:text-2xl">
          {title}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          {description}
        </p>
        {actions ? (
          <div className="mt-7 flex flex-wrap justify-center gap-3">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
