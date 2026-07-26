# KeepSolved

Keep what you solve. Pattern triggers, graded recall drills, and a mastery curve so you still know it on interview day.

Formerly prototyped as “LeetCode Journal.”

## Stack

| Layer | Choice |
|-------|--------|
| App | Next.js 16.2 App Router + React 19 |
| DB | Prisma 7 + Neon Postgres |
| Auth | Better Auth (email + Google + GitHub) |
| Jobs | Trigger.dev v4 |
| Cache / RL | Upstash Redis |
| Files | Vercel Blob |
| Notes | BlockNote |
| Whiteboard | Excalidraw |
| Code | CodeMirror 6 |
| SRS | ts-fsrs |

## Quick start

```bash
pnpm install
cp .env.example .env
# Fill DATABASE_URL + DIRECT_URL (Neon), BETTER_AUTH_SECRET
pnpm db:push
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Full vendor setup (Vercel, Trigger, Upstash, OAuth): see [DEPLOY.md](./DEPLOY.md).

## Product map

- `/` — landing
- `/signup` `/login` — auth
- `/dashboard` — private aggregated profile
- `/dashboard/platforms` — connect + verify handles
- `/dashboard/settings` — username / visibility
- `/u/[username]` — public profile + OG card
- `/status` — integration health
- `/journal` — paste LeetCode URL → entry
- `/journal/[id]` — notes + Excalidraw + solution
- `/journal/review` — FSRS due queue

## Design

Achromatic shell. Color is data only — Codeforces-style rating spectrum for bands, difficulty, and the Trajectory signature chart.

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Prisma generate + Next build |
| `pnpm db:push` | Push schema to Neon |
| `pnpm trigger:dev` | Local Trigger.dev worker |
| `pnpm trigger:deploy` | Deploy Trigger tasks |

## Legal note

LeetCode has no official public API. We use the undocumented GraphQL endpoint with user-initiated sync, caching, and cooldowns. We do not proxy Premium content.
