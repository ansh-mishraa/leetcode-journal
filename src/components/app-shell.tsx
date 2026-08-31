import Link from "next/link";
import {
  BookOpen,
  Brain,
  LayoutDashboard,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "@/components/command-palette";
import { KeepSolvedLogo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  icon: typeof Brain;
};

function buildAppLinks(entryCount: number): NavLink[] {
  const core: NavLink[] = [
    { href: "/recall", label: "Recall", icon: Brain },
    { href: "/journal", label: "Journal", icon: BookOpen },
    { href: "/dashboard", label: "Profile", icon: LayoutDashboard },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];
  // New users: put the first action first so they don't hunt for it.
  if (entryCount === 0) {
    return [
      { href: "/try", label: "Start", icon: Sparkles },
      ...core.filter((l) => l.href !== "/dashboard/settings"),
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ];
  }
  return core;
}

export async function AppShell({
  children,
  active,
  marketing = false,
  fullBleed = false,
}: {
  children: React.ReactNode;
  active?: string;
  marketing?: boolean;
  fullBleed?: boolean;
}) {
  const session = await getSession();

  let dueCount = 0;
  let entryCount = 0;
  const hasUsername = Boolean(session?.user.username);
  if (session) {
    try {
      [dueCount, entryCount] = await Promise.all([
        prisma.reviewCard.count({
          where: { userId: session.user.id, due: { lte: new Date() } },
        }),
        prisma.journalEntry.count({ where: { userId: session.user.id } }),
      ]);
    } catch {
      dueCount = 0;
      entryCount = 0;
    }
  }

  const appLinks = buildAppLinks(entryCount);
  const mobileLinks = appLinks
    .filter((l) =>
      ["/try", "/recall", "/journal", "/dashboard"].includes(l.href)
    )
    .slice(0, 4);

  const primaryCta =
    entryCount === 0
      ? { href: "/try", label: "Add a problem" }
      : dueCount > 0
        ? { href: "/recall", label: `Review ${dueCount} due` }
        : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <Link
            href={session && !marketing ? "/start" : "/"}
            className="transition-opacity hover:opacity-80"
            aria-label="KeepSolved home"
          >
            <KeepSolvedLogo size="sm" />
          </Link>

          {session && !marketing ? (
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
              {appLinks.map((l) => {
                const Icon = l.icon;
                const isActive =
                  active === l.href ||
                  (l.href === "/try" && active === "/try") ||
                  (l.href !== "/dashboard" &&
                    l.href !== "/try" &&
                    active?.startsWith(l.href));
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm transition-all duration-200",
                      isActive
                        ? "bg-ink-raised text-foreground shadow-[inset_0_0_0_1px_var(--rule)]"
                        : "text-muted hover:bg-ink-raised/60 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {l.label}
                    {l.href === "/recall" && dueCount > 0 ? (
                      <span className="font-data text-[10px] text-band-expert">
                        {dueCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          ) : (
            <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
              <Link href="/try" className="transition hover:text-foreground">
                Try instantly
              </Link>
              <Link
                href="/#how-it-works"
                className="transition hover:text-foreground"
              >
                How it works
              </Link>
              <Link href="/status" className="transition hover:text-foreground">
                Status
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {session && !marketing && primaryCta ? (
              <Link
                href={primaryCta.href}
                className="btn btn-primary hidden h-9 px-4 text-sm sm:inline-flex"
              >
                {primaryCta.label}
              </Link>
            ) : null}
            {session && !marketing ? <CommandPalette /> : null}
            <ThemeToggle />
            {session ? (
              <Link
                href={
                  hasUsername
                    ? `/u/${session.user.username}`
                    : "/dashboard/settings"
                }
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 font-data text-xs text-muted transition hover:border-chalk/20 hover:text-foreground"
              >
                <UserRound className="size-3.5" aria-hidden />
                {hasUsername ? `@${session.user.username}` : "Claim @username"}
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden rounded-full px-3 py-2 text-sm text-muted transition hover:text-foreground sm:inline"
                >
                  Sign in
                </Link>
                <Link href="/try" className="btn btn-primary h-9 px-4 text-sm">
                  Try free
                </Link>
              </div>
            )}
          </div>
        </div>

        {session && entryCount === 0 && !marketing ? (
          <div className="border-t border-border bg-ink-sunken/80">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <p className="text-muted">
                <span className="font-medium text-foreground">How it works:</span>
                {" "}
                Pick a problem → Write what triggers the pattern → Practice recall.
              </p>
              <Link
                href="/try"
                className="shrink-0 font-medium text-band-expert underline-offset-2 hover:underline"
              >
                Start here
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main
        className={cn(
          "w-full flex-1",
          fullBleed ? "max-w-none px-0 py-0" : "mx-auto max-w-7xl px-4 py-8",
          session && !marketing && "pb-mobile-nav md:pb-8",
        )}
      >
        {children}
      </main>

      {session && !marketing ? (
        <nav className="mobile-nav md:hidden" aria-label="Mobile primary">
          <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1">
            {mobileLinks.map((l) => {
              const Icon = l.icon;
              const isActive =
                active === l.href ||
                (l.href !== "/dashboard" &&
                  l.href !== "/try" &&
                  active?.startsWith(l.href));
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] transition",
                      isActive ? "text-foreground" : "text-muted",
                    )}
                  >
                    <Icon
                      className={cn("size-5", isActive && "text-band-expert")}
                      aria-hidden
                    />
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
