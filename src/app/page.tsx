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
  const primaryHref = session ? "/start" : "/try";
  const primaryLabel = session
    ? "Continue where you left off"
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

      {/* Core value props */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <article className="relative overflow-hidden rounded-3xl border border-border bg-ink-raised p-8 md:p-12">
              <div
                className="pointer-events-none absolute -right-8 top-0 size-48 rounded-full blur-3xl"
                style={{
                  background:
                    "color-mix(in srgb, var(--band-expert) 20%, transparent)",
                }}
                aria-hidden
              />
              <div className="relative">
                <p className="font-data text-[11px] uppercase tracking-[0.2em] text-muted">
                  The system
                </p>
                <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
                  Remember patterns, not solutions
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
                  Write the pattern trigger for each problem. Practice recall on a schedule. 
                  Watch your retention grow as the loop keeps everything fresh until interview day.
                </p>
                <svg
                  viewBox="0 0 400 100"
                  className="mt-10 h-auto w-full"
                  aria-hidden
                >
                  <path
                    d="M20 80 C80 75, 120 65, 160 50 S240 25, 280 30 S350 45, 380 15"
                    fill="none"
                    stroke="url(#curve-g)"
                    strokeWidth="3"
                    className="spark-draw"
                  />
                  <defs>
                    <linearGradient id="curve-g" x1="0" x2="1">
                      <stop offset="0%" stopColor="var(--band-pupil)" />
                      <stop offset="50%" stopColor="var(--band-expert)" />
                      <stop offset="100%" stopColor="var(--band-master)" />
                    </linearGradient>
                  </defs>
                </svg>
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
