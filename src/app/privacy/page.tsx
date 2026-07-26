import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${BRAND.name} handles your account, journal, and platform data.`,
};

export default function PrivacyPage() {
  return (
    <AppShell marketing>
      <PageHeader
        eyebrow="Legal"
        title="Privacy"
        description={`${BRAND.name} is built for your recall practice. We collect only what the product needs to run.`}
      />
      <article className="mx-auto max-w-2xl space-y-8 text-sm leading-relaxed text-muted">
        <section className="space-y-3">
          <h2 className="font-display text-lg text-foreground">What we store</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Account email, name, and auth provider data (email, Google, or GitHub).</li>
            <li>Journal entries you create: notes, diagrams, solutions, pattern triggers, and review grades.</li>
            <li>Optional platform handles you connect (e.g. LeetCode, Codeforces) and public profile fields you choose to show.</li>
            <li>Technical logs needed for rate limits, jobs, and debugging.</li>
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-lg text-foreground">What we don’t do</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>We don’t sell personal data.</li>
            <li>We don’t scrape Premium LeetCode content or proxy paywalled material.</li>
            <li>We don’t make private profiles public without your settings.</li>
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-lg text-foreground">Public profiles</h2>
          <p>
            If you set a username and leave visibility public, anyone can view
            your Trajectory card at{" "}
            <code className="font-data text-foreground">/u/yourname</code>. You
            can change visibility anytime in Settings.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-lg text-foreground">Third parties</h2>
          <p>
            Auth, database, file storage, background jobs, and AI hints may run
            on vendors we configure for the deployment (e.g. Neon, Vercel, Better
            Auth providers, Groq). They process data only to provide those
            services.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-lg text-foreground">Contact</h2>
          <p>
            Questions about privacy: reach the maker via the project README or
            the launch channel posted with {BRAND.name}. See also{" "}
            <Link href="/terms" className="text-foreground underline-offset-2 hover:underline">
              Terms
            </Link>
            .
          </p>
        </section>
      </article>
    </AppShell>
  );
}
