import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { probeIntegrationHealth } from "@/server/platforms";
import { PLATFORMS } from "@/lib/platforms";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusCopy = {
  ok: { label: "Healthy", tone: "bg-band-pupil/15 text-band-pupil", dot: "var(--band-pupil)" },
  degraded: {
    label: "Degraded",
    tone: "bg-band-master/15 text-band-master",
    dot: "var(--band-master)",
  },
  down: { label: "Down", tone: "bg-destructive/15 text-destructive", dot: "var(--destructive)" },
} as const;

export default async function StatusPage() {
  const health = await probeIntegrationHealth();
  const counts = {
    ok: health.filter((h) => h.status === "ok").length,
    degraded: health.filter((h) => h.status === "degraded").length,
    down: health.filter((h) => h.status === "down").length,
  };

  return (
    <AppShell marketing>
      <PageHeader
        eyebrow="Transparency"
        title="Integration status"
        description="Scrapers rot, so we surface it. Official APIs stay healthy; unofficial GraphQL and HTML adapters are marked degraded by default."
      />

      <div className="mb-6 flex flex-wrap gap-3">
        {(["ok", "degraded", "down"] as const).map((k) => (
          <div
            key={k}
            className="flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5"
          >
            <span
              className="size-2 rounded-full"
              style={{ background: statusCopy[k].dot }}
              aria-hidden
            />
            <span className="font-data text-xs text-muted">
              {statusCopy[k].label}
            </span>
            <span className="font-data text-sm" data-numeric>
              {counts[k]}
            </span>
          </div>
        ))}
      </div>

      <ul className="space-y-2">
        {health.map((h, i) => {
          const meta = statusCopy[h.status as keyof typeof statusCopy];
          return (
            <li
              key={h.platform}
              className="surface-interactive flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-4 animate-float-in"
              style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className="mt-1.5 size-2 shrink-0 rounded-full"
                  style={{ background: meta?.dot }}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="font-medium">{PLATFORMS[h.platform].label}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">
                    {h.message}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 font-data text-[10px] uppercase tracking-wider",
                  meta?.tone,
                )}
              >
                {meta?.label ?? h.status}
              </span>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
