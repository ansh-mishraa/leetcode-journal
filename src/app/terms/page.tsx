import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Terms",
  description: `Terms of use for ${BRAND.name}.`,
};

export default function TermsPage() {
  return (
    <AppShell marketing>
      <PageHeader
        eyebrow="Legal"
        title="Terms"
        description={`By using ${BRAND.name}, you agree to these terms.`}
      />
      <article className="mx-auto max-w-2xl space-y-8 text-sm leading-relaxed text-muted">
        <section className="space-y-3">
          <h2 className="font-display text-lg text-foreground">The product</h2>
          <p>
            {BRAND.name} helps you journal coding problems and schedule graded
            recall. Features may change as the product evolves. We may suspend
            abuse, scraping, or accounts that break these terms.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-lg text-foreground">Your content</h2>
          <p>
            You own the notes, diagrams, and solutions you write. You grant us a
            limited license to store and display them so the product can work —
            including on your public profile when you enable it.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-lg text-foreground">Platforms</h2>
          <p>
            Connecting third-party coding platforms is optional and user-initiated.
            Those platforms have their own terms. {BRAND.name} is not affiliated
            with LeetCode, Codeforces, or other OJ brands.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-lg text-foreground">No warranty</h2>
          <p>
            The service is provided as-is. Interview outcomes aren’t guaranteed.
            AI hints (when enabled) can be wrong — always verify against the
            problem and your own judgment.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-display text-lg text-foreground">Privacy</h2>
          <p>
            How we handle data is described in{" "}
            <Link
              href="/privacy"
              className="text-foreground underline-offset-2 hover:underline"
            >
              Privacy
            </Link>
            .
          </p>
        </section>
      </article>
    </AppShell>
  );
}
