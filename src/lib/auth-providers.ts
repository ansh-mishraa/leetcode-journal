/**
 * Client-safe OAuth flags. Set these in `.env` alongside the real secrets
 * so login/signup can show the right buttons without leaking secrets.
 *
 * Server still requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET to work.
 */
export const oauthProviders = {
  google: process.env.NEXT_PUBLIC_GOOGLE_AUTH === "true",
  github: process.env.NEXT_PUBLIC_GITHUB_AUTH === "true",
} as const;

export const hasAnyOAuth =
  oauthProviders.google || oauthProviders.github;
