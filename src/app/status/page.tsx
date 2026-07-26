import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { probeIntegrationHealth } from "@/server/platforms";
import { PLATFORMS } from "@/lib/platforms";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const health = await probeIntegrationHealth();

  return (
    <AppShell marketing>
      <PageHeader
        eyebrow="Transparency"
        title="Integration status"
        description="Scrapers rot. We surface it. Official APIs stay healthy; unofficial GraphQL and HTML adapters are marked degraded by default."
      />
      <ul className="space-y-3">
        {health.map((h, i) => (
          <li
            key={h.platform}
            className="surface-interactive flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-4 animate-float-in"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div>
              <p className="font-medium">{PLATFORMS[h.platform].label}</p>
              <p className="mt-0.5 text-sm text-muted">{h.message}</p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 font-data text-[10px] uppercase tracking-wider",
                h.status === "ok" && "bg-band-pupil/15 text-band-pupil",
                h.status === "degraded" && "bg-band-master/15 text-band-master",
                h.status === "down" && "bg-destructive/15 text-destructive",
              )}
            >
              {h.status}
            </span>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
