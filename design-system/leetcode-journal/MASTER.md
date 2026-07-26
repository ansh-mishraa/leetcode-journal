# Design System — LeetCode Journal (Master)

> Persisted from ui-ux-pro-max, then **overridden** for product specificity.
> Tool suggested teal light + Inter + Portfolio Grid — rejected as generic.
> Source of truth: Codeforces rating spectrum as the only chroma.

## Product

- **Type:** Developer productivity / coding portfolio + journal
- **Audience:** DSA / CP candidates preparing for interviews
- **Single job (landing):** Make them feel their growth is visible — then start
- **Single job (app):** Never lose the next step (connect → verify → journal → review)

## Visual identity

**Thesis:** Color is data, never decoration.

### Neutrals (achromatic shell)
| Token | Dark | Light |
|-------|------|-------|
| ink | `#0E1117` | `#F4F3F1` |
| ink-raised | `#161B24` | `#FFFFFF` |
| ink-sunken | `#090B0F` | `#E8E6E3` |
| chalk | `#ECEEF2` | `#12151C` |
| graphite | `#8B919C` | `#5A606B` |
| rule | `rgba(255,255,255,0.08)` | `rgba(18,21,28,0.1)` |

### Spectrum (semantic only)
| Band | Hex |
|------|-----|
| Newcomer | `#9CA3AF` |
| Pupil | `#10B981` |
| Specialist | `#06B6D4` |
| Expert | `#3B82F6` |
| Candidate Master | `#8B5CF6` |
| Master | `#F59E0B` |
| Grandmaster | `#EF4444` |

### Typography
- Display: **Bricolage Grotesque** (handles, heroes, section titles)
- UI: **Inter**
- Data: **JetBrains Mono** + `tabular-nums` for every number/handle/timestamp

### Signature
**The Trajectory** — hand-plotted SVG rating+volume curve. Landing hero and profile apex.

### Motion
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out feel)
- Micro: 150–250ms hover (transform/opacity only)
- Reveal: stagger 60–80ms, y:16 → 0, opacity 0 → 1
- Respect `prefers-reduced-motion`

### Anti-patterns
- No purple-on-white SaaS gradients
- No acid-green terminal aesthetic as primary
- No cream + terracotta editorial
- No emoji icons
- No card grids in the hero
- No forced unskippable onboarding

## UX flow (so users are never lost)

1. **Land** → see Trajectory thesis + one CTA
2. **Sign up** → claim username immediately (settings prompt)
3. **Connect** first platform (guided empty state, 3 steps visible)
4. **Verify** with copyable token + field hint
5. **Dashboard** fills → tease Journal
6. **Journal** → paste URL → notes/draw → review queue

Always show: where I am, what to do next, one primary action.
