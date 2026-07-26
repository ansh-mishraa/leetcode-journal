import { LeetCode } from "leetcode-query";
import type { PlatformAdapter, AdapterResult } from "./types";
import { PLATFORMS } from "@/lib/platforms";

const lc = new LeetCode();

export const leetcodeAdapter: PlatformAdapter = {
  platform: "LEETCODE",

  async fetchProfile(handle): Promise<AdapterResult> {
    try {
      const user = await lc.user(handle);
      if (!user?.matchedUser) {
        return { ok: false, error: "User not found", code: "NOT_FOUND" };
      }

      const matched = user.matchedUser;
      const submit = matched.submitStats?.acSubmissionNum ?? [];
      const byDiff = Object.fromEntries(
        submit.map((s: { difficulty: string; count: number }) => [
          s.difficulty.toLowerCase(),
          s.count,
        ]),
      );

      let rating: number | null = null;
      let contestsAttended: number | null = null;
      let ranking: number | null = null;
      const ratingHistory: { at: string; rating: number; contest?: string }[] =
        [];

      try {
        const contest = await lc.user_contest_info(handle);
        if (contest?.userContestRanking) {
          rating = contest.userContestRanking.rating ?? null;
          contestsAttended =
            contest.userContestRanking.attendedContestsCount ?? null;
          ranking = contest.userContestRanking.globalRanking ?? null;
        }
        if (Array.isArray(contest?.userContestRankingHistory)) {
          for (const h of contest.userContestRankingHistory) {
            if (!h?.attended || h.rating == null) continue;
            const start = h.contest?.startTime
              ? new Date(h.contest.startTime * 1000).toISOString()
              : new Date().toISOString();
            ratingHistory.push({
              at: start,
              rating: h.rating,
              contest: h.contest?.title,
            });
          }
        }
      } catch {
        // Contest data is optional
      }

      const activity: { date: string; count: number }[] = [];
      try {
        const cal = matched.submissionCalendar
          ? (JSON.parse(matched.submissionCalendar) as Record<string, number>)
          : {};
        for (const [ts, count] of Object.entries(cal)) {
          const d = new Date(Number(ts) * 1000);
          activity.push({
            date: d.toISOString().slice(0, 10),
            count,
          });
        }
      } catch {
        // ignore calendar parse errors
      }

      const badges =
        matched.badges?.map((b: { displayName?: string; name?: string; icon?: string }) => ({
          name: b.displayName ?? b.name ?? "Badge",
          icon: b.icon,
        })) ?? [];

      return {
        ok: true,
        profile: {
          handle: matched.username ?? handle,
          avatarUrl: matched.profile?.userAvatar,
          profileUrl: PLATFORMS.LEETCODE.profileUrl(handle),
          totalSolved: byDiff.all ?? byDiff.All ?? null,
          difficulty: {
            easy: byDiff.easy ?? null,
            medium: byDiff.medium ?? null,
            hard: byDiff.hard ?? null,
          },
          rating,
          maxRating: ratingHistory.length
            ? Math.max(...ratingHistory.map((r) => r.rating))
            : rating,
          contestsAttended,
          ranking: matched.profile?.ranking ?? ranking,
          reputation: matched.profile?.reputation ?? null,
          badges,
          topics: [],
          ratingHistory,
          activity,
          raw: user,
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "LeetCode fetch failed";
      if (/not found|404/i.test(message)) {
        return { ok: false, error: message, code: "NOT_FOUND" };
      }
      if (/429|rate/i.test(message)) {
        return { ok: false, error: message, code: "RATE_LIMIT" };
      }
      return { ok: false, error: message, code: "UPSTREAM" };
    }
  },

  async readVerificationField(handle) {
    try {
      const user = await lc.user(handle);
      if (!user?.matchedUser) {
        return { ok: false, error: "User not found" };
      }
      const about = user.matchedUser.profile?.aboutMe ?? "";
      return { ok: true, value: about };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to read profile",
      };
    }
  },
};
