# KeepSolved — Launch kit

Ship the product, then run this playbook. Goal: get interview-prep folks from a post → `/try` → signup in one sitting.

## Pre-flight (do before any post)

- [ ] Production URL live; `NEXT_PUBLIC_APP_URL` + `BETTER_AUTH_URL` match it (no trailing slash)
- [ ] Google + GitHub OAuth callbacks point at prod
- [ ] Smoke: `/` → `/try` → load a problem → `/signup` → claim works
- [ ] Set a public username; open `/u/you` in an incognito window
- [ ] Paste prod URL into [opengraph.xyz](https://www.opengraph.xyz/) — card shows tagline + mark
- [ ] `/sitemap.xml` and `/robots.txt` resolve
- [ ] Privacy + Terms linked in footer

## Positioning (one sentence)

**KeepSolved** is spaced recall for DSA — you capture the *pattern trigger* when you solve, then get graded drills on an FSRS schedule so you still know it on interview day. Aggregation/profile is optional proof, not the product.

**Not:** another LeetCode tracker, solved-count dashboard, or AI that writes solutions for you.

## Primary funnel

```
Tweet / PH / Reddit
  → keepsolved.app
  → /try  (no signup)
  → write one trigger
  → Save → signup
  → claim → /recall
```

Always link **`/try`** in maker replies when someone asks “how do I start?”

---

## Product Hunt

### Title
KeepSolved

### Tagline (≤60 chars)
Solve it once. Still know it on interview day.

### Description (short)
Most “solved” problems evaporate before the interview. KeepSolved is a Recall Engine: capture the pattern trigger when you solve, then drill with graded Recall / Re-implement / Diagnose cards on an FSRS schedule. Public Trajectory cards are optional credibility — not the toll before value.

### First comment (maker)
Hey PH 👋

I built KeepSolved because my LeetCode “solved” count lied to me in interviews.

What it does:
1. Paste a problem → jot the *trigger* that points to the pattern
2. Get scheduled graded recall (not passive review)
3. Optionally publish a Trajectory card when you want proof

Try without signup: **[your-url]/try**

Would love feedback from anyone grinding interviews right now — especially on the trigger UX and the three review modes.

### Gallery tips
1. Landing hero (Trajectory)
2. `/try` loading a real problem
3. Journal Recall card + trigger fields
4. Recall Engine grading UI
5. Public `/u/you` card / OG image

---

## X / Twitter

### Launch tweet
```
I kept "solving" LeetCode and blanking in interviews.

So I built KeepSolved — spaced recall for DSA.

• Capture the pattern trigger when you solve
• Graded Recall drills on an FSRS schedule
• Try a problem with zero signup

→ [your-url]/try
```

### Thread (optional beats)
1. Problem: solved ≠ retained
2. Insight: pattern *trigger* > rewriting the full solution every time
3. Product: three modes — Recall / Re-implement / Diagnose
4. Proof: public Trajectory is optional
5. CTA: `/try`

### Reply bait
Ask: “What’s the last problem you solved that you’d fail tomorrow?”

---

## Reddit

Be useful first. Soft-launch in comments; dedicated posts only where self-promo is allowed.

### r/cscareerquestions / r/leetcode angle
Lead with the retention problem, not the brand. Offer `/try` as a free loop to feel the difference. Disclose you’re the maker.

### Sample comment
```
I had the same issue — green checks, empty whiteboard later.

I’ve been using a spaced-recall loop: write the *pattern trigger* the day you solve, then grade yourself later (recall / re-implement). I packaged it as KeepSolved if you want to try the flow without signup: [url]/try
```

Avoid: “Check out my startup!!”, engagement bait, multi-sub spam on day one.

---

## LinkedIn (short)

```
Interview prep tip: track triggers, not just solves.

When you finish a problem, write the 1-line signal that should fire the pattern next time. Schedule a graded recall before the interview — not the night before.

I built KeepSolved around that loop (try without signup): [url]/try
```

---

## Share loop inside the product

After a user sets a public username:
1. Open `/u/you`
2. **Copy link** or **Post** (pre-filled tweet)
3. Download card for stories / PH gallery

Makers should pin their own `/u/you` in bios during launch week.

---

## Metrics to watch (week 1)

| Signal | Healthy |
|--------|---------|
| `/` → `/try` | people click the promise |
| `/try` → signup | trigger UX landed |
| Signup → first save | claim path works |
| Public profile views | share loop alive |

No analytics wired yet — use Vercel/host logs + manual PH/Twitter link UTMs if you add them (`?utm_source=ph`).

---

## Do / Don’t

**Do:** demo `/try` live; talk about blanking in interviews; ask for trigger examples.  
**Don’t:** claim LeetCode affiliation; promise offers; dunk on other trackers by name.
