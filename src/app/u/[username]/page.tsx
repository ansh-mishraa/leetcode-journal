import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProfileView } from "@/components/profile-view";
import { ShareCardButton } from "@/components/share-card-button";
import { MasteryCurve } from "@/components/mastery-curve";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getAggregatedProfileByUsername } from "@/server/aggregation";
import { getMasteryCurve } from "@/server/journal/mastery";
import { absoluteUrl } from "@/lib/utils";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username}`,
    description: `Coding trajectory and mastery curve for @${username}`,
    openGraph: {
      title: `@${username} · KeepSolved`,
      images: [{ url: absoluteUrl(`/u/${username}/opengraph-image`) }],
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const result = await getAggregatedProfileByUsername(username);

  if (!result) notFound();

  if (result.private) {
    return (
      <AppShell>
        <EmptyState
          className="mt-10"
          icon={Lock}
          accent="var(--band-master)"
          title={`@${username} is private`}
          description="This profile owner hasn't published their Trajectory. Build your own instead — it takes one problem."
          actions={<Button href="/try">Try a problem</Button>}
        />
      </AppShell>
    );
  }

  const mastery = result.userId ? await getMasteryCurve(result.userId) : [];

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="font-data text-[11px] uppercase tracking-[0.22em] text-muted">
          Public card
        </p>
        <ShareCardButton username={username} />
      </div>
      <MasteryCurve points={mastery} className="mb-6" />
      <ProfileView profile={result.profile} />
    </AppShell>
  );
}
