import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProfileView } from "@/components/profile-view";
import { ShareCardButton } from "@/components/share-card-button";
import { MasteryCurve } from "@/components/mastery-curve";
import { getAggregatedProfileByUsername } from "@/server/aggregation";
import { getMasteryCurve } from "@/server/journal/mastery";
import { absoluteUrl } from "@/lib/utils";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username}`,
    description: `Coding trajectory for @${username} on LeetCode Journal`,
    openGraph: {
      title: `@${username} · LeetCode Journal`,
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
        <div className="mx-auto max-w-md py-20 text-center">
          <h1 className="font-display text-3xl">@{username}</h1>
          <p className="mt-3 text-muted">This profile is private.</p>
        </div>
      </AppShell>
    );
  }

  const mastery = result.userId
    ? await getMasteryCurve(result.userId)
    : [];

  return (
    <AppShell>
      <div className="mb-4 flex justify-end">
        <ShareCardButton username={username} />
      </div>
      <MasteryCurve points={mastery} className="mb-6" />
      <ProfileView profile={result.profile} />
    </AppShell>
  );
}
