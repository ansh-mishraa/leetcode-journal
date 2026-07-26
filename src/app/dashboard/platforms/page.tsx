import { AppShell } from "@/components/app-shell";
import { ConnectPlatforms } from "@/components/connect-platforms";
import { PageHeader } from "@/components/ui/page-header";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import type { PlatformId } from "@/lib/platforms";

export default async function PlatformsPage() {
  const session = await requireSession();
  const accounts = await prisma.platformAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <AppShell active="/dashboard/platforms">
      <PageHeader
        eyebrow="Step 1–2 · Platforms"
        title="Connect & verify"
        description="Enter a public handle, copy the token into the field we name, then verify. You can remove the token right after."
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {[
          {
            t: "1. Connect",
            d: "Paste username or profile URL",
            active: true,
          },
          {
            t: "2. Paste token",
            d: "Into Summary / Name / Bio",
            active: accounts.some((a) => a.status !== "VERIFIED"),
          },
          {
            t: "3. Verify",
            d: "We read it once — done",
            active: accounts.some((a) => a.status === "VERIFIED"),
          },
        ].map((s) => (
          <div
            key={s.t}
            className="rounded-xl border border-border bg-card px-4 py-3"
          >
            <p className="font-data text-[11px] uppercase tracking-wider text-band-expert">
              {s.t}
            </p>
            <p className="mt-1 text-sm text-muted">{s.d}</p>
          </div>
        ))}
      </div>

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
