import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { TryWorkspace } from "@/components/try/try-workspace";
import { PageHeader } from "@/components/ui/page-header";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Try a problem",
  description:
    "Load any LeetCode problem, capture the pattern trigger, and feel the Recall loop before creating an account.",
};

export default async function TryPage() {
  const session = await getSession();

  return (
    <AppShell marketing={!session} active={session ? "/try" : undefined}>
      <PageHeader
        eyebrow={session ? "Add a problem" : "Try instantly · no signup"}
        title={session ? "Add your next problem" : "See how it works"}
        description={
          session
            ? "Paste any LeetCode URL. Write what triggers this pattern. That's it — we'll schedule the recall practice for you."
            : "Paste a LeetCode URL and write what triggers the pattern. Save when you're ready for scheduled recall practice."
        }
      />
      <TryWorkspace signedIn={Boolean(session)} />
    </AppShell>
  );
}
