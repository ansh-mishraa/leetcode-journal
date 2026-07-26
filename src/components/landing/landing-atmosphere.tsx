"use client";

/** Full-bleed atmospheric layer: spectrum orbs, drifting grid, film grain. */
export function LandingAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="landing-grid absolute inset-0 opacity-70 dark:opacity-100" />
      <div
        className="landing-orb absolute -left-[12%] top-[-8%] h-[55vmin] w-[55vmin] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--band-expert) 32%, transparent), transparent 68%)",
        }}
      />
      <div
        className="landing-orb landing-orb-delay absolute -right-[8%] top-[8%] h-[48vmin] w-[48vmin] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--band-master) 26%, transparent), transparent 70%)",
        }}
      />
      <div
        className="landing-orb absolute bottom-[-10%] left-[30%] h-[42vmin] w-[42vmin] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--band-pupil) 20%, transparent), transparent 72%)",
          animationDelay: "-9s",
        }}
      />
      <div className="landing-noise absolute inset-0" />
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(to top, var(--background), transparent)",
        }}
      />
    </div>
  );
}
