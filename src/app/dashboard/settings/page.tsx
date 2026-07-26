import { AppShell } from "@/components/app-shell";
import { SettingsForm } from "@/components/settings-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export default async function SettingsPage() {
  const session = await requireSession();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  return (
    <AppShell active="/dashboard/settings">
      <PageHeader
        eyebrow="Settings"
        title="Your identity"
        description="Claim a public username so others can find /u/you. Control who sees your Trajectory."
      />
      <div className="max-w-lg">
        <SettingsForm
          initial={{
            name: user.name,
            username: user.username ?? "",
            bio: user.bio ?? "",
            isPublic: user.isPublic,
          }}
        />
      </div>
    </AppShell>
  );
}
