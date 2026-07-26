import { prisma } from "@/lib/db";

/** After GitHub OAuth, create a pre-verified PlatformAccount. */
export async function linkGitHubFromOAuth(opts: {
  userId: string;
  accessToken: string | null | undefined;
}) {
  let handle = "unknown";
  let avatarUrl: string | undefined;
  let profileUrl: string | undefined;

  if (opts.accessToken) {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${opts.accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "leetcode-journal",
      },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        login: string;
        avatar_url?: string;
        html_url?: string;
      };
      handle = data.login;
      avatarUrl = data.avatar_url;
      profileUrl = data.html_url;
    }
  }

  await prisma.platformAccount.upsert({
    where: {
      userId_platform: {
        userId: opts.userId,
        platform: "GITHUB",
      },
    },
    create: {
      userId: opts.userId,
      platform: "GITHUB",
      handle,
      status: "VERIFIED",
      verifiedAt: new Date(),
      avatarUrl,
      profileUrl,
      verificationToken: null,
    },
    update: {
      handle,
      status: "VERIFIED",
      verifiedAt: new Date(),
      avatarUrl,
      profileUrl,
    },
  });
}
