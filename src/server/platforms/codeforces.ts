import type { PlatformAdapter, AdapterResult, RatingPoint } from "./types";
import { PLATFORMS } from "@/lib/platforms";

interface CfResponse<T> {
  status: string;
  comment?: string;
  result?: T;
}

async function cfGet<T>(path: string): Promise<CfResponse<T>> {
  const res = await fetch(`https://codeforces.com/api/${path}`, {
    headers: { "User-Agent": "leetcode-journal/1.0" },
    next: { revalidate: 0 },
  });
  return (await res.json()) as CfResponse<T>;
}

export const codeforcesAdapter: PlatformAdapter = {
  platform: "CODEFORCES",

  async fetchProfile(handle): Promise<AdapterResult> {
    try {
      const info = await cfGet<
        Array<{
          handle: string;
          rating?: number;
          maxRating?: number;
          rank?: string;
          titlePhoto?: string;
          firstName?: string;
          lastName?: string;
        }>
      >(`user.info?handles=${encodeURIComponent(handle)}`);

      if (info.status !== "OK" || !info.result?.[0]) {
        return {
          ok: false,
          error: info.comment ?? "User not found",
          code: "NOT_FOUND",
        };
      }

      const user = info.result[0];

      const status = await cfGet<
        Array<{
          verdict: string;
          creationTimeSeconds: number;
          problem: { contestId?: number; index: string; name: string; tags?: string[] };
        }>
      >(`user.status?handle=${encodeURIComponent(handle)}&from=1&count=10000`);

      const solved = new Set<string>();
      const topicMap = new Map<string, number>();
      const dayMap = new Map<string, number>();

      if (status.status === "OK" && status.result) {
        for (const sub of status.result) {
          if (sub.verdict !== "OK") continue;
          const key = `${sub.problem.contestId ?? ""}${sub.problem.index}`;
          if (solved.has(key)) continue;
          solved.add(key);
          for (const tag of sub.problem.tags ?? []) {
            topicMap.set(tag, (topicMap.get(tag) ?? 0) + 1);
          }
          const day = new Date(sub.creationTimeSeconds * 1000)
            .toISOString()
            .slice(0, 10);
          dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
        }
      }

      const ratingRes = await cfGet<
        Array<{
          contestId: number;
          contestName: string;
          ratingUpdateTimeSeconds: number;
          newRating: number;
        }>
      >(`user.rating?handle=${encodeURIComponent(handle)}`);

      const ratingHistory: RatingPoint[] = [];
      if (ratingRes.status === "OK" && ratingRes.result) {
        for (const c of ratingRes.result) {
          ratingHistory.push({
            at: new Date(c.ratingUpdateTimeSeconds * 1000).toISOString(),
            rating: c.newRating,
            contest: c.contestName,
          });
        }
      }

      return {
        ok: true,
        profile: {
          handle: user.handle,
          avatarUrl: user.titlePhoto,
          profileUrl: PLATFORMS.CODEFORCES.profileUrl(handle),
          totalSolved: solved.size,
          difficulty: { easy: null, medium: null, hard: null },
          rating: user.rating ?? null,
          maxRating: user.maxRating ?? null,
          contestsAttended: ratingHistory.length,
          ranking: null,
          reputation: null,
          badges: user.rank ? [{ name: user.rank }] : [],
          topics: [...topicMap.entries()]
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 30),
          ratingHistory,
          activity: [...dayMap.entries()].map(([date, count]) => ({
            date,
            count,
          })),
          raw: { info: user },
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Codeforces fetch failed",
        code: "UPSTREAM",
      };
    }
  },

  async readVerificationField(handle) {
    try {
      const info = await cfGet<
        Array<{ firstName?: string; lastName?: string }>
      >(`user.info?handles=${encodeURIComponent(handle)}`);
      if (info.status !== "OK" || !info.result?.[0]) {
        return { ok: false, error: info.comment ?? "User not found" };
      }
      return { ok: true, value: info.result[0].firstName ?? "" };
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : "Failed to read Codeforces",
      };
    }
  },
};
