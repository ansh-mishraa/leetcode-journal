import { AppShell } from "@/components/app-shell";
import { TryWorkspace } from "@/components/try/try-workspace";
import { PageHeader } from "@/components/ui/page-header";
import { getSession } from "@/lib/session";

export default async function TryPage() {
  const session = await getSession();

  return (
    <AppShell marketing={!session}>
      <PageHeader
        eyebrow="Try instantly · no signup"
        title="Load a problem. Feel the loop."
        description="Paste a LeetCode URL, capture the pattern trigger, then save when you want reviews. Account comes after the aha — not before."
      />
      <TryWorkspace signedIn={Boolean(session)} />
    </AppShell>
  );
}
