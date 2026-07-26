import Link from "next/link";
import { Brain, LineChart, PenLine } from "lucide-react";
import { KeepSolvedLogo } from "@/components/brand/logo";

const proof = [
  {
    icon: PenLine,
    title: "Pattern triggers",
    body: "The signal you noticed, saved next to the problem.",
    accent: "var(--band-pupil)",
  },
  {
    icon: Brain,
    title: "Graded recall",
    body: "Recall, Re-implement, Diagnose — scheduled by FSRS.",
    accent: "var(--band-expert)",
  },
  {
    icon: LineChart,
    title: "Mastery curve",
    body: "Retention you can see, and a card you can share.",
    accent: "var(--band-master)",
  },
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-stage flex min-h-screen flex-col lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between border-r border-border px-12 py-12 lg:flex">
        <Link href="/" aria-label="KeepSolved home">
          <KeepSolvedLogo />
        </Link>

        <div>
          <h2 className="max-w-md font-display text-4xl leading-[1.05] tracking-tight">
            Solve it once.{" "}
            <span className="bg-gradient-to-r from-band-pupil via-band-expert to-band-master bg-clip-text text-transparent">
              Still know it
            </span>{" "}
            on interview day.
          </h2>
          <ul className="mt-10 space-y-5">
            {proof.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.title} className="flex gap-4">
                  <span
                    className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: `color-mix(in srgb, ${p.accent} 15%, transparent)`,
                      color: p.accent,
                    }}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-medium">{p.title}</span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {p.body}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="font-data text-xs text-muted">
          Free Groq coaching · Platforms optional
        </p>
      </aside>

      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="lg:hidden" aria-label="KeepSolved home">
            <KeepSolvedLogo size="sm" />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
