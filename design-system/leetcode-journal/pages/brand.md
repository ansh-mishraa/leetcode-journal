# KeepSolved brand

## Name
**KeepSolved** — solved stays solved.

## Tagline
Solve it once. Still know it on interview day.

## Mark
Dark rounded square + light check + spectrum return arc (retention loop).

## Wordmark
`Keep` in foreground · `Solved` in pupil→expert→master gradient.

## Code
- Component: `src/components/brand/logo.tsx`
- Constants: `src/lib/brand.ts`
- Raster: `public/brand/mark.png`, `public/brand/lockup.png`
- Favicon: `src/app/icon.tsx` · Apple: `src/app/apple-icon.tsx`
- Social preview: `src/app/opengraph-image.tsx`

## Usage
- Nav / auth / footer: `<KeepSolvedLogo />`
- Favicon / app icon: mark only
- Clear space: ≥ 0.25× mark height around the lockup
- Don’t recolor the mark’s check; spectrum arc is the only chroma
