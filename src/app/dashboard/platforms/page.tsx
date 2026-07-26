import { AppShell } from "@/components/app-shell";
import { ConnectPlatforms } from "@/components/connect-platforms";
import { PageHeader } from "@/components/ui/page-header";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import type { PlatformId } from "@/lib/platforms";
import { cn } from "@/lib/utils";

export default async function PlatformsPage() {
  const session = await requireSession();
  const accounts = await prisma.platformAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  const hasAccounts = accounts.length > 0;
  const hasVerified = accounts.some((a) => a.status === "VERIFIED");

  const steps = [
    {
      title: "Connect",
      body: "Paste a public username or profile URL.",
      done: hasAccounts,
      current: !hasAccounts,
    },
    {
      title: "Paste token",
      body: "Drop it into your bio, summary, or name field.",
      done: hasVerified,
      current: hasAccounts && !hasVerified,
    },
    {
      title: "Verify",
      body: "We read it once — then you can delete it.",
      done: hasVerified,
      current: false,
    },
  ];

  return (
    <AppShell active="/dashboard/platforms">
      <PageHeader
        eyebrow="Optional · credibility"
        title="Connect & verify"
        description="Public stats sync right away. Verification proves the handle is yours and unlocks your shareable card."
        backHref="/dashboard"
        backLabel="Dashboard"
      />

      <ol className="mb-8 grid gap-3 sm:grid-cols-3">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className={cn(
              "relative overflow-hidden rounded-2xl border px-4 py-4",
              s.current
                ? "border-band-expert/40 bg-band-expert/[0.06]"
                : "border-border bg-card",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full font-data text-[10px]",
                  s.done
                    ? "bg-band-pupil/20 text-band-pupil"
                    : s.current
                      ? "bg-band-expert/20 text-band-expert"
                      : "bg-ink-sunken text-muted",
                )}
              >
                {i + 1}
              </span>
              <p className="font-medium">{s.title}</p>
            </div>
            <p className="mt-1.5 text-sm text-muted">{s.body}</p>
          </li>
        ))}
      </ol>

      <ConnectPlatforms
        accounts={accounts.map((a) => ({
          id: a.id,
          platform: a.platform as PlatformId,
          handle: a.handle,
          status: a.status,
          verificationToken: a.verificationToken,
          syncStatus: a.syncStatus,
          syncError: a.syncError,
          lastSyncedAt: a.lastSyncedAt?.toISOString() ?? null,
        }))}
      />
    </AppShell>
  );
}
