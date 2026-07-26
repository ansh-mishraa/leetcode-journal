import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { KeepSolvedLogo } from "@/components/brand/logo";
import { LandingAtmosphere } from "@/components/landing/landing-atmosphere";
import { HeroTrajectory } from "@/components/landing/hero-trajectory";
import { LandingFlow } from "@/components/landing/landing-flow";
import { LandingModes } from "@/components/landing/landing-modes";
import { LandingCta } from "@/components/landing/landing-cta";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { getSession } from "@/lib/session";
import { absoluteUrl } from "@/lib/utils";

export default async function HomePage() {
  const session = await getSession();
  const primaryHref = session ? "/recall" : "/try";
  const primaryLabel = session
    ? "Open Recall Engine"
    : "Try a problem — no signup";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: BRAND.name,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description: BRAND.shortPitch,
    url: absoluteUrl("/"),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <AppShell marketing fullBleed>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero — one composition, brand + thesis + Trajectory */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <LandingAtmosphere />

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col px-4 pb-10 pt-10 md:pb-14 md:pt-14">
          <div className="flex flex-1 flex-col justify-center">
            <div className="hero-rise">
              <KeepSolvedLogo size="lg" />
            </div>
            <h1 className="hero-rise hero-rise-d1 mt-5 max-w-3xl font-display text-[2.6rem] leading-[0.98] tracking-tight md:text-6xl lg:text-[4.25rem]">
              Solve it once.{" "}
              <span className="bg-gradient-to-r from-band-pupil via-band-expert to-band-master bg-clip-text text-transparent">
                Still know it
              </span>{" "}
              on interview day.
            </h1>
            <p className="hero-rise hero-rise-d2 mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              Capture the pattern trigger. Get graded Recall drills on an FSRS
              schedule — before the blank page returns.
            </p>
            <div className="hero-rise hero-rise-d3 mt-8 flex flex-wrap items-center gap-3">
              <Button href={primaryHref} className="h-12 px-6 text-base">
                {primaryLabel}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
              <Button
                href="/#how-it-works"
                variant="secondary"
                className="h-12 px-6"
              >
                See the loop
              </Button>
            </div>
          </div>

          <div className="hero-rise hero-rise-d5 mt-10 md:mt-6">
            <HeroTrajectory />
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{
            background:
              "linear-gradient(to top, var(--background), transparent)",
          }}
          aria-hidden
        />
      </section>

      <LandingFlow />
      <LandingModes />

      {/* Differentiator — retention vs aggregation */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 md:gap-6">
          <Reveal>
            <article className="relative overflow-hidden rounded-3xl border border-border bg-ink-raised p-7 md:p-9">
              <div
                className="pointer-events-none absolute -right-8 top-0 size-40 rounded-full blur-3xl"
                style={{
                  background:
                    "color-mix(in srgb, var(--band-expert) 20%, transparent)",
                }}
                aria-hidden
              />
              <p className="font-data text-[11px] uppercase tracking-[0.2em] text-muted">
                The product
              </p>
              <h2 className="mt-3 font-display text-2xl tracking-tight md:text-3xl">
                Recall Engine
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
                Pattern triggers, graded drills, and a mastery curve for what
                you&apos;ll actually remember — not what you once solved.
              </p>
              <svg
                viewBox="0 0 320 100"
                className="mt-8 h-auto w-full"
                aria-hidden
              >
                <path
                  d="M20 80 C60 78, 80 70, 110 55 S160 30, 200 35 S260 50, 300 18"
                  fill="none"
                  stroke="url(#diff-g)"
                  strokeWidth="2.5"
                  className="spark-draw"
                />
                <defs>
                  <linearGradient id="diff-g" x1="0" x2="1">
                    <stop offset="0%" stopColor="var(--band-pupil)" />
                    <stop offset="100%" stopColor="var(--band-master)" />
                  </linearGradient>
                </defs>
              </svg>
            </article>
          </Reveal>
          <Reveal stagger={2}>
            <article className="relative overflow-hidden rounded-3xl border border-border bg-ink-raised p-7 md:p-9">
              <div
                className="pointer-events-none absolute -right-8 top-0 size-40 rounded-full blur-3xl"
                style={{
                  background:
                    "color-mix(in srgb, var(--band-master) 18%, transparent)",
                }}
                aria-hidden
              />
              <p className="font-data text-[11px] uppercase tracking-[0.2em] text-muted">
                The reward
              </p>
              <h2 className="mt-3 font-display text-2xl tracking-tight md:text-3xl">
                Trajectory card
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
                Connect platforms when you want shareable proof. Aggregation is
                credibility — never the toll before you get value.
              </p>
              <div className="mt-8 flex items-end gap-2">
                {[40, 55, 48, 70, 62, 85, 92].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md"
                    style={{
                      height: `${h * 0.7}px`,
                      background: `color-mix(in srgb, var(--band-expert) ${30 + i * 8}%, transparent)`,
                    }}
                  />
                ))}
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <LandingCta
        primaryHref={primaryHref}
        primaryLabel={primaryLabel}
        showLogin={!session}
      />
    </AppShell>
  );
}
