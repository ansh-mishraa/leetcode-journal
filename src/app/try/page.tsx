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
    <AppShell marketing={!session}>
      <PageHeader
        eyebrow={session ? "Quick capture" : "Try instantly · no signup"}
        title="Load a problem. Feel the loop."
        description="Paste a LeetCode URL, write the signal that points to the pattern, then save when you want scheduled reviews."
      />
      <TryWorkspace signedIn={Boolean(session)} />
    </AppShell>
  );
}
