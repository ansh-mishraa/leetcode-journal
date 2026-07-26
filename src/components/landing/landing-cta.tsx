import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { KeepSolvedLogo } from "@/components/brand/logo";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export function LandingCta({
  primaryHref,
  primaryLabel,
  showLogin,
}: {
  primaryHref: string;
  primaryLabel: string;
  showLogin: boolean;
}) {
  return (
    <section className="relative px-4 pb-20 pt-8 md:pb-28 md:pt-12">
      <Reveal>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-border">
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              background: `
                radial-gradient(ellipse 80% 70% at 20% 0%, color-mix(in srgb, var(--band-pupil) 22%, transparent), transparent 55%),
                radial-gradient(ellipse 70% 60% at 90% 20%, color-mix(in srgb, var(--band-expert) 24%, transparent), transparent 50%),
                radial-gradient(ellipse 60% 50% at 50% 100%, color-mix(in srgb, var(--band-master) 18%, transparent), transparent 55%),
                var(--ink-raised)
              `,
            }}
          />
          <div className="landing-noise absolute inset-0 opacity-[0.06]" aria-hidden />
          <div className="relative px-6 py-14 text-center md:px-16 md:py-20">
            <p className="font-data text-[11px] uppercase tracking-[0.24em] text-muted">
              One problem. The whole loop.
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl tracking-tight md:text-5xl">
              Feel retention before you commit an account
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted md:text-base">
              Load a problem, write the trigger, save when it clicks. Platforms
              and public cards stay optional.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button href={primaryHref} className="h-12 px-6 text-base">
                {primaryLabel}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
              {showLogin ? (
                <Button href="/login" variant="secondary" className="h-12 px-6">
                  I already have an account
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Reveal>

      <footer className="mx-auto mt-14 flex max-w-6xl flex-wrap items-center justify-between gap-3 px-1 text-xs text-muted">
        <KeepSolvedLogo size="sm" />
        <div className="flex gap-5">
          <Link href="/try" className="transition hover:text-foreground">
            Try
          </Link>
          <Link href="/status" className="transition hover:text-foreground">
            Status
          </Link>
          <Link href="/login" className="transition hover:text-foreground">
            Sign in
          </Link>
        </div>
      </footer>
    </section>
  );
}
