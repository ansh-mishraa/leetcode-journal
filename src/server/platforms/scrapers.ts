import type { PlatformAdapter, AdapterResult } from "./types";
import { PLATFORMS } from "@/lib/platforms";

async function fetchJson<T>(url: string): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "leetcode-journal/1.0",
        Accept: "application/json, text/html",
      },
    });
    if (!res.ok) {
      return { ok: false, status: res.status, error: `HTTP ${res.status}` };
    }
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      return { ok: true, data: (await res.json()) as T };
    }
    // Some unofficial endpoints return JSON with text/html content-type
    const text = await res.text();
    try {
      return { ok: true, data: JSON.parse(text) as T };
    } catch {
      return { ok: false, status: res.status, error: "Non-JSON response" };
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : "Fetch failed",
    };
  }
}

function htmlField(html: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; LeetCodeJournal/1.0; +https://localhost)",
      Accept: "text/html",
    },
  });
  if (!res.ok) return null;
  return res.text();
}

export const codechefAdapter: PlatformAdapter = {
  platform: "CODECHEF",
  async fetchProfile(handle): Promise<AdapterResult> {
    const html = await fetchHtml(
      `https://www.codechef.com/users/${encodeURIComponent(handle)}`,
    );
    if (!html) {
      return { ok: false, error: "Profile not found", code: "NOT_FOUND" };
    }
    if (/404|not found/i.test(html) && !/user-details/i.test(html)) {
      return { ok: false, error: "Profile not found", code: "NOT_FOUND" };
    }

    const ratingMatch = html.match(/rating[^0-9]*([0-9]{3,4})/i);
    const fullySolved = html.match(/Fully Solved[^0-9]*([0-9]+)/i);
    const rating = ratingMatch ? Number(ratingMatch[1]) : null;
    const totalSolved = fullySolved ? Number(fullySolved[1]) : null;

    return {
      ok: true,
      profile: {
        handle,
        profileUrl: PLATFORMS.CODECHEF.profileUrl(handle),
        totalSolved,
        difficulty: { easy: null, medium: null, hard: null },
        rating,
        maxRating: rating,
        contestsAttended: null,
        ranking: null,
        reputation: null,
        badges: [],
        topics: [],
        ratingHistory: [],
        activity: [],
      },
    };
  },
  async readVerificationField(handle) {
    const html = await fetchHtml(
      `https://www.codechef.com/users/${encodeURIComponent(handle)}`,
    );
    if (!html) return { ok: false, error: "Profile not found" };
    const name = htmlField(html, [
      /<h1[^>]*user-name-box[^>]*>[\s\S]*?<span[^>]*>([^<]+)/i,
      /"name"\s*:\s*"([^"]+)"/i,
    ]);
    return { ok: true, value: name };
  },
};

export const gfgAdapter: PlatformAdapter = {
  platform: "GEEKSFORGEEKS",
  async fetchProfile(handle): Promise<AdapterResult> {
    const result = await fetchJson<{
      info?: { user_name?: string; profile_url?: string; score?: number };
      solvedStats?: Record<string, { count?: number }>;
    }>(`https://geeks-for-geeks-api.vercel.app/${encodeURIComponent(handle)}`);

    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
        code: result.status === 404 ? "NOT_FOUND" : "UPSTREAM",
      };
    }

    const stats = result.data.solvedStats ?? {};
    const easy = stats.easy?.count ?? stats.Easy?.count ?? null;
    const medium = stats.medium?.count ?? stats.Medium?.count ?? null;
    const hard = stats.hard?.count ?? stats.Hard?.count ?? null;
    const basic = stats.basic?.count ?? stats.Basic?.count ?? 0;
    const school = stats.school?.count ?? stats.School?.count ?? 0;
    const total =
      (easy ?? 0) + (medium ?? 0) + (hard ?? 0) + basic + school || null;

    return {
      ok: true,
      profile: {
        handle: result.data.info?.user_name ?? handle,
        profileUrl: PLATFORMS.GEEKSFORGEEKS.profileUrl(handle),
        totalSolved: total,
        difficulty: { easy, medium, hard },
        rating: result.data.info?.score ?? null,
        maxRating: null,
        contestsAttended: null,
        ranking: null,
        reputation: null,
        badges: [],
        topics: [],
        ratingHistory: [],
        activity: [],
        raw: result.data,
      },
    };
  },
  async readVerificationField(handle) {
    const html = await fetchHtml(
      `https://auth.geeksforgeeks.org/user/${encodeURIComponent(handle)}/`,
    );
    if (!html) return { ok: false, error: "Profile not found" };
    const name = htmlField(html, [
      /profile_name[^>]*>([^<]+)/i,
      /"name"\s*:\s*"([^"]+)"/i,
      /<h1[^>]*>([^<]+)<\/h1>/i,
    ]);
    return { ok: true, value: name };
  },
};

export const hackerrankAdapter: PlatformAdapter = {
  platform: "HACKERRANK",
  async fetchProfile(handle): Promise<AdapterResult> {
    const result = await fetchJson<{
      model?: {
        username?: string;
        avatar?: string;
        country?: string;
      };
    }>(
      `https://www.hackerrank.com/rest/contests/master/hackers/${encodeURIComponent(handle)}/profile`,
    );
    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
        code: result.status === 404 ? "NOT_FOUND" : "UPSTREAM",
      };
    }
    return {
      ok: true,
      profile: {
        handle: result.data.model?.username ?? handle,
        avatarUrl: result.data.model?.avatar,
        profileUrl: PLATFORMS.HACKERRANK.profileUrl(handle),
        totalSolved: null,
        difficulty: { easy: null, medium: null, hard: null },
        rating: null,
        maxRating: null,
        contestsAttended: null,
        ranking: null,
        reputation: null,
        badges: [],
        topics: [],
        ratingHistory: [],
        activity: [],
        raw: result.data,
      },
    };
  },
  async readVerificationField(handle) {
    const result = await fetchJson<{
      model?: { name?: string; first_name?: string };
    }>(
      `https://www.hackerrank.com/rest/contests/master/hackers/${encodeURIComponent(handle)}/profile`,
    );
    if (!result.ok) return { ok: false, error: result.error };
    const value =
      result.data.model?.first_name ?? result.data.model?.name ?? null;
    return { ok: true, value };
  },
};

export const atcoderAdapter: PlatformAdapter = {
  platform: "ATCODER",
  async fetchProfile(handle): Promise<AdapterResult> {
    const rank = await fetchJson<{ count?: number; rank?: number }>(
      `https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_rank?user=${encodeURIComponent(handle)}`,
    );

    if (!rank.ok) {
      // Fallback: profile page existence
      const html = await fetchHtml(
        `https://atcoder.jp/users/${encodeURIComponent(handle)}`,
      );
      if (!html) {
        return { ok: false, error: "User not found", code: "NOT_FOUND" };
      }
      const ratingMatch = html.match(/Rating<\/th>\s*<td[^>]*>\s*<span[^>]*>(\d+)/i);
      return {
        ok: true,
        profile: {
          handle,
          profileUrl: PLATFORMS.ATCODER.profileUrl(handle),
          totalSolved: null,
          difficulty: { easy: null, medium: null, hard: null },
          rating: ratingMatch ? Number(ratingMatch[1]) : null,
          maxRating: null,
          contestsAttended: null,
          ranking: null,
          reputation: null,
          badges: [],
          topics: [],
          ratingHistory: [],
          activity: [],
        },
      };
    }

    return {
      ok: true,
      profile: {
        handle,
        profileUrl: PLATFORMS.ATCODER.profileUrl(handle),
        totalSolved: rank.data.count ?? null,
        difficulty: { easy: null, medium: null, hard: null },
        rating: null,
        maxRating: null,
        contestsAttended: null,
        ranking: rank.data.rank ?? null,
        reputation: null,
        badges: [],
        topics: [],
        ratingHistory: [],
        activity: [],
        raw: rank.data,
      },
    };
  },
  async readVerificationField(handle) {
    const html = await fetchHtml(
      `https://atcoder.jp/users/${encodeURIComponent(handle)}`,
    );
    if (!html) return { ok: false, error: "User not found" };
    const aff = htmlField(html, [
      /Affiliation<\/th>\s*<td[^>]*>([^<]*)/i,
      /affiliation[^>]*>([^<]+)/i,
    ]);
    return { ok: true, value: aff };
  },
};

export const interviewbitAdapter: PlatformAdapter = {
  platform: "INTERVIEWBIT",
  async fetchProfile(handle): Promise<AdapterResult> {
    const html = await fetchHtml(
      `https://www.interviewbit.com/profile/${encodeURIComponent(handle)}`,
    );
    if (!html) {
      return { ok: false, error: "Profile not found or private", code: "PRIVATE" };
    }
    const score = html.match(/Score[^0-9]*([0-9]+)/i);
    return {
      ok: true,
      profile: {
        handle,
        profileUrl: PLATFORMS.INTERVIEWBIT.profileUrl(handle),
        totalSolved: null,
        difficulty: { easy: null, medium: null, hard: null },
        rating: score ? Number(score[1]) : null,
        maxRating: null,
        contestsAttended: null,
        ranking: null,
        reputation: null,
        badges: [],
        topics: [],
        ratingHistory: [],
        activity: [],
      },
    };
  },
  async readVerificationField(handle) {
    const html = await fetchHtml(
      `https://www.interviewbit.com/profile/${encodeURIComponent(handle)}`,
    );
    if (!html) return { ok: false, error: "Profile not found or private" };
    const bio = htmlField(html, [
      /class="[^"]*bio[^"]*"[^>]*>([^<]*)/i,
      /"about"\s*:\s*"([^"]*)"/i,
    ]);
    return { ok: true, value: bio };
  },
};

export const code360Adapter: PlatformAdapter = {
  platform: "CODE360",
  async fetchProfile(handle): Promise<AdapterResult> {
    const html = await fetchHtml(
      `https://www.naukri.com/code360/profile/${encodeURIComponent(handle)}`,
    );
    if (!html) {
      return { ok: false, error: "Profile not found", code: "NOT_FOUND" };
    }
    const solved = html.match(/Problems Solved[^0-9]*([0-9]+)/i);
    return {
      ok: true,
      profile: {
        handle,
        profileUrl: PLATFORMS.CODE360.profileUrl(handle),
        totalSolved: solved ? Number(solved[1]) : null,
        difficulty: { easy: null, medium: null, hard: null },
        rating: null,
        maxRating: null,
        contestsAttended: null,
        ranking: null,
        reputation: null,
        badges: [],
        topics: [],
        ratingHistory: [],
        activity: [],
      },
    };
  },
  async readVerificationField(handle) {
    const html = await fetchHtml(
      `https://www.naukri.com/code360/profile/${encodeURIComponent(handle)}`,
    );
    if (!html) return { ok: false, error: "Profile not found" };
    const name = htmlField(html, [
      /<h1[^>]*>([^<]+)<\/h1>/i,
      /"name"\s*:\s*"([^"]+)"/i,
    ]);
    return { ok: true, value: name };
  },
};
