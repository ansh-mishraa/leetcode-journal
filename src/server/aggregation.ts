import { prisma } from "@/lib/db";
import type { PlatformId } from "@/lib/platforms";
import { PLATFORMS } from "@/lib/platforms";
import {
  bandHex,
  type SkillBandKey,
  SKILL_BANDS,
} from "@/lib/spectrum";

export type TrajectoryPoint = {
  date: string;
  rating: number | null;
  volume: number;
  contest?: string;
  platform?: PlatformId;
  bandColor: string;
};

export type AggregatedProfile = {
  username: string | null;
  name: string;
  bio: string | null;
  image: string | null;
  isPublic: boolean;
  skillBand: SkillBandKey;
  skillBandLabel: string;
  skillBandColor: string;
  totals: {
    solved: number;
    easy: number;
    medium: number;
    hard: number;
    contests: number;
  };
  platforms: Array<{
    platform: PlatformId;
    label: string;
    short: string;
    handle: string;
    status: string;
    verified: boolean;
    profileUrl: string | null;
    avatarUrl: string | null;
    lastSyncedAt: string | null;
    syncStatus: string;
    syncError: string | null;
    totalSolved: number | null;
    easy: number | null;
    medium: number | null;
    hard: number | null;
    rating: number | null;
    maxRating: number | null;
  }>;
  topics: Array<{ name: string; count: number }>;
  heatmap: Array<{ date: string; count: number }>;
  streaks: { current: number; longest: number };
  trajectory: TrajectoryPoint[];
};

export async function getAggregatedProfile(
  userId: string,
): Promise<AggregatedProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      platformAccounts: {
        include: {
          snapshots: {
            orderBy: { capturedAt: "desc" },
            take: 1,
          },
        },
        orderBy: { platform: "asc" },
      },
      dailyActivity: {
        orderBy: { date: "asc" },
      },
    },
  });

  if (!user) return null;

  let solved = 0;
  let easy = 0;
  let medium = 0;
  let hard = 0;
  let contests = 0;
  const topicMap = new Map<string, number>();
  const trajectory: TrajectoryPoint[] = [];

  const platforms = user.platformAccounts.map((a) => {
    const snap = a.snapshots[0];
    if (snap) {
      solved += snap.totalSolved ?? 0;
      easy += snap.easy ?? 0;
      medium += snap.medium ?? 0;
      hard += snap.hard ?? 0;
      contests += snap.contestsAttended ?? 0;

      const topics = (snap.topics as Array<{ name: string; count: number }> | null) ?? [];
      for (const t of topics) {
        topicMap.set(t.name, (topicMap.get(t.name) ?? 0) + t.count);
      }

      const history =
        (snap.ratingHistory as Array<{
          at: string;
          rating: number;
          contest?: string;
        }> | null) ?? [];
      for (const h of history) {
        trajectory.push({
          date: h.at.slice(0, 10),
          rating: h.rating,
          volume: 0,
          contest: h.contest,
          platform: a.platform,
          bandColor: bandHex(user.skillBand as SkillBandKey),
        });
      }
    }

    return {
      platform: a.platform as PlatformId,
      label: PLATFORMS[a.platform as PlatformId].label,
      short: PLATFORMS[a.platform as PlatformId].short,
      handle: a.handle,
      status: a.status,
      verified: a.status === "VERIFIED",
      profileUrl: a.profileUrl,
      avatarUrl: a.avatarUrl,
      lastSyncedAt: a.lastSyncedAt?.toISOString() ?? null,
      syncStatus: a.syncStatus,
      syncError: a.syncError,
      totalSolved: snap?.totalSolved ?? null,
      easy: snap?.easy ?? null,
      medium: snap?.medium ?? null,
      hard: snap?.hard ?? null,
      rating: snap?.rating ?? null,
      maxRating: snap?.maxRating ?? null,
    };
  });

  // Merge daily activity across platforms
  const heatMap = new Map<string, number>();
  for (const d of user.dailyActivity) {
    const key = d.date.toISOString().slice(0, 10);
    heatMap.set(key, (heatMap.get(key) ?? 0) + d.count);
  }
  const heatmap = [...heatMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Volume into trajectory (by day)
  for (const h of heatmap) {
    trajectory.push({
      date: h.date,
      rating: null,
      volume: h.count,
      bandColor: bandHex(user.skillBand as SkillBandKey),
    });
  }

  trajectory.sort((a, b) => a.date.localeCompare(b.date));

  return {
    username: user.username,
    name: user.name,
    bio: user.bio,
    image: user.image,
    isPublic: user.isPublic,
    skillBand: user.skillBand as SkillBandKey,
    skillBandLabel: SKILL_BANDS[user.skillBand as SkillBandKey].label,
    skillBandColor: bandHex(user.skillBand as SkillBandKey),
    totals: { solved, easy, medium, hard, contests },
    platforms,
    topics: [...topicMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    heatmap,
    streaks: computeStreaks(heatmap),
    trajectory,
  };
}

function computeStreaks(heatmap: Array<{ date: string; count: number }>) {
  if (!heatmap.length) return { current: 0, longest: 0 };
  const active = new Set(heatmap.filter((h) => h.count > 0).map((h) => h.date));
  const sorted = [...active].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    if (prev) {
      const diff =
        (new Date(d).getTime() - new Date(prev).getTime()) / 86400000;
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = d;
  }

  // Current streak ending today or yesterday
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  const yStr = y.toISOString().slice(0, 10);

  let current = 0;
  let cursor = active.has(todayStr)
    ? todayStr
    : active.has(yStr)
      ? yStr
      : null;
  while (cursor && active.has(cursor)) {
    current += 1;
    const c = new Date(cursor);
    c.setDate(c.getDate() - 1);
    cursor = c.toISOString().slice(0, 10);
  }

  return { current, longest };
}

export async function getAggregatedProfileByUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, isPublic: true },
  });
  if (!user) return null;
  if (!user.isPublic) return { private: true as const };
  const profile = await getAggregatedProfile(user.id);
  return profile
    ? { private: false as const, profile, userId: user.id }
    : null;
}
