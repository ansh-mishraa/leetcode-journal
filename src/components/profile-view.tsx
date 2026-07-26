import type { AggregatedProfile } from "@/server/aggregation";
import { Trajectory } from "@/components/trajectory";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { cn } from "@/lib/utils";

export function ProfileView({
  profile,
  isOwner = false,
  refreshSlot,
}: {
  profile: AggregatedProfile;
  isOwner?: boolean;
  refreshSlot?: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="glass-panel rounded-2xl p-5 animate-float-in">
          {profile.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.image}
              alt=""
              className="mb-4 size-16 rounded-2xl border border-border object-cover"
            />
          ) : (
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-border bg-ink-sunken font-display text-2xl">
              {(profile.username ?? profile.name).slice(0, 1).toUpperCase()}
            </div>
          )}
          <h1 className="font-display text-2xl tracking-tight">
            {profile.username ? `@${profile.username}` : profile.name}
          </h1>
          {profile.bio ? (
            <p className="mt-2 text-sm leading-relaxed text-muted">{profile.bio}</p>
          ) : null}

          <div className="mt-4 flex items-center gap-2">
            <span
              className="size-2.5 rounded-full pulse-dot"
              style={{ background: profile.skillBandColor }}
              aria-hidden
            />
            <span
              className="font-data text-xs uppercase tracking-wider"
              style={{ color: profile.skillBandColor }}
            >
              {profile.skillBandLabel}
            </span>
          </div>

          <ul className="mt-5 space-y-2.5 border-t border-border pt-4">
            {profile.platforms.map((p) => (
              <li
                key={p.platform}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="font-data text-[10px] text-muted">{p.short}</span>
                <a
                  href={p.profileUrl ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate font-data text-xs transition hover:text-band-expert"
                >
                  @{p.handle}
                </a>
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    p.verified ? "bg-band-pupil" : "bg-band-master",
                  )}
                  title={p.verified ? "Verified" : "Unverified"}
                />
              </li>
            ))}
          </ul>

          {isOwner && refreshSlot ? (
            <div className="mt-5 border-t border-border pt-4">{refreshSlot}</div>
          ) : null}
        </div>
      </aside>

      <div className="space-y-6">
        <div className="animate-float-in" style={{ animationDelay: "60ms" }}>
          <Trajectory
            points={profile.trajectory}
            bandColor={profile.skillBandColor}
          />
        </div>

        <section
          className="glass-panel rounded-2xl p-5 animate-float-in md:p-6"
          style={{ animationDelay: "120ms" }}
        >
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <Stat label="Solved" value={profile.totals.solved} />
            <Stat label="Easy" value={profile.totals.easy} tone="easy" />
            <Stat label="Medium" value={profile.totals.medium} tone="medium" />
            <Stat label="Hard" value={profile.totals.hard} tone="hard" />
          </div>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-ink-sunken">
            {(() => {
              const t =
                profile.totals.easy +
                  profile.totals.medium +
                  profile.totals.hard || 1;
              return (
                <div className="flex h-full">
                  <div
                    className="h-full bg-diff-easy transition-all duration-700"
                    style={{ width: `${(profile.totals.easy / t) * 100}%` }}
                  />
                  <div
                    className="h-full bg-diff-medium transition-all duration-700"
                    style={{ width: `${(profile.totals.medium / t) * 100}%` }}
                  />
                  <div
                    className="h-full bg-diff-hard transition-all duration-700"
                    style={{ width: `${(profile.totals.hard / t) * 100}%` }}
                  />
                </div>
              );
            })()}
          </div>
          <p className="mt-3 font-data text-xs text-muted">
            streak {profile.streaks.current}d · best {profile.streaks.longest}d ·{" "}
            {profile.totals.contests} contests
          </p>
        </section>

        <div className="animate-float-in" style={{ animationDelay: "180ms" }}>
          <ActivityHeatmap days={profile.heatmap} />
        </div>

        <section
          className="glass-panel rounded-2xl p-5 animate-float-in md:p-6"
          style={{ animationDelay: "220ms" }}
        >
          <h2 className="font-display text-lg tracking-tight">Per platform</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="py-2 pr-3 font-medium">Platform</th>
                  <th className="py-2 pr-3 font-medium">Solved</th>
                  <th className="py-2 pr-3 font-medium">Rating</th>
                  <th className="py-2 font-medium">Sync</th>
                </tr>
              </thead>
              <tbody>
                {profile.platforms.map((p) => (
                  <tr
                    key={p.platform}
                    className="border-b border-border/60 transition hover:bg-ink-sunken/40"
                  >
                    <td className="py-3 pr-3">
                      <span className="font-medium">{p.label}</span>
                      <span className="ml-2 font-data text-xs text-muted">
                        @{p.handle}
                      </span>
                    </td>
                    <td className="py-3 pr-3 font-data" data-numeric>
                      {p.totalSolved ?? "—"}
                    </td>
                    <td className="py-3 pr-3 font-data" data-numeric>
                      {p.rating != null ? Math.round(p.rating) : "—"}
                    </td>
                    <td className="py-3 font-data text-xs text-muted">
                      {p.syncStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {profile.topics.length > 0 ? (
          <section className="glass-panel rounded-2xl p-5 md:p-6">
            <h2 className="font-display text-lg tracking-tight">Topics</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {profile.topics.map((t) => (
                <li
                  key={t.name}
                  className="rounded-full border border-border px-3 py-1.5 font-data text-xs transition hover:border-band-expert/40"
                >
                  {t.name}{" "}
                  <span className="text-muted" data-numeric>
                    {t.count}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "easy" | "medium" | "hard";
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 font-data text-3xl tracking-tight md:text-4xl",
          tone === "easy" && "text-diff-easy",
          tone === "medium" && "text-diff-medium",
          tone === "hard" && "text-diff-hard",
        )}
        data-numeric
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}
