# Deployment checklist

## 1. Neon Postgres
1. Create a project at https://console.neon.tech
2. Copy the **pooled** connection string → `DATABASE_URL` (hostname contains `-pooler`)
3. Copy the **direct** connection string → `DIRECT_URL`
4. Run locally: `pnpm db:push`

## 2. Vercel
1. `npx vercel link` then `npx vercel env pull`
2. Set all vars from `.env.example`
3. Deploy: `npx vercel --prod`
4. Set `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` to the production URL

## 3. Better Auth
1. Generate `BETTER_AUTH_SECRET` (`openssl rand -base64 32`)
2. Optional: create Google / GitHub OAuth apps
3. Callback URL: `{APP_URL}/api/auth/callback/{provider}`

## 4. Upstash Redis
1. Create database via Vercel Marketplace or upstash.com
2. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

## 5. Trigger.dev
1. `pnpm trigger:dev` to login and create project
2. Set `TRIGGER_SECRET_KEY` and `TRIGGER_PROJECT_ID`
3. Deploy workers: `pnpm trigger:deploy`

## 6. Vercel Blob
1. Enable Blob in the Vercel project
2. Set `BLOB_READ_WRITE_TOKEN`

## Smoke test
1. Sign up with email
2. Claim username in Settings
3. Connect LeetCode handle → copy token → paste in Summary → Verify
4. Connect Codeforces → Verify
5. Open Dashboard → confirm Trajectory / heatmap populate
6. Open `/u/{username}` and share OG preview
7. Journal: paste `two-sum` → save notes → rate a review card
