import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type AppSession = {
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["session"];
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    username: string | null;
    bio: string | null;
    isPublic: boolean;
  };
};

export async function getSession(): Promise<AppSession | null> {
  try {
    const base = await auth.api.getSession({
      headers: await headers(),
    });
    if (!base) return null;

    const dbUser = await prisma.user.findUnique({
      where: { id: base.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        username: true,
        bio: true,
        isPublic: true,
      },
    });

    if (!dbUser) return null;

    return {
      session: base.session,
      user: dbUser,
    };
  } catch (error) {
    console.error("getSession failed", error);
    return null;
  }
}

export async function requireSession(): Promise<AppSession> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
