import type { PlatformAdapter, AdapterResult } from "./types";
import { PLATFORMS } from "@/lib/platforms";

function ghHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "leetcode-journal",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export const githubAdapter: PlatformAdapter = {
  platform: "GITHUB",

  async fetchProfile(handle): Promise<AdapterResult> {
    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(handle)}`, {
        headers: ghHeaders(),
      });
      if (res.status === 404) {
        return { ok: false, error: "User not found", code: "NOT_FOUND" };
      }
      if (res.status === 403) {
        return { ok: false, error: "GitHub rate limited", code: "RATE_LIMIT" };
      }
      if (!res.ok) {
        return { ok: false, error: `GitHub HTTP ${res.status}`, code: "UPSTREAM" };
      }

      const user = (await res.json()) as {
        login: string;
        avatar_url: string;
        html_url: string;
        public_repos: number;
        followers: number;
        bio?: string;
      };

      // Contribution calendar via GraphQL when token present
      const activity: { date: string; count: number }[] = [];
      if (process.env.GITHUB_TOKEN) {
        try {
          const gql = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: {
              ...ghHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `query($login:String!){
                user(login:$login){
                  contributionsCollection {
                    contributionCalendar {
                      weeks { contributionDays { date contributionCount } }
                    }
                  }
                }
              }`,
              variables: { login: handle },
            }),
          });
          if (gql.ok) {
            const data = (await gql.json()) as {
              data?: {
                user?: {
                  contributionsCollection?: {
                    contributionCalendar?: {
                      weeks: Array<{
                        contributionDays: Array<{
                          date: string;
                          contributionCount: number;
                        }>;
                      }>;
                    };
                  };
                };
              };
            };
            const weeks =
              data.data?.user?.contributionsCollection?.contributionCalendar
                ?.weeks ?? [];
            for (const week of weeks) {
              for (const day of week.contributionDays) {
                if (day.contributionCount > 0) {
                  activity.push({
                    date: day.date,
                    count: day.contributionCount,
                  });
                }
              }
            }
          }
        } catch {
          // contributions optional
        }
      }

      return {
        ok: true,
        profile: {
          handle: user.login,
          avatarUrl: user.avatar_url,
          profileUrl: user.html_url ?? PLATFORMS.GITHUB.profileUrl(handle),
          totalSolved: user.public_repos,
          difficulty: { easy: null, medium: null, hard: null },
          rating: null,
          maxRating: null,
          contestsAttended: null,
          ranking: null,
          reputation: user.followers,
          badges: [],
          topics: [],
          ratingHistory: [],
          activity,
          raw: user,
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "GitHub fetch failed",
        code: "UPSTREAM",
      };
    }
  },

  async readVerificationField() {
    // GitHub uses OAuth — no token field.
    return { ok: true, value: null };
  },
};
