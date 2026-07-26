import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@prisma/client", "leetcode-query"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "**.leetcode.com" },
      { protocol: "https", hostname: "userpic.codeforces.org" },
    ],
  },
  transpilePackages: ["@excalidraw/excalidraw"],
};

export default nextConfig;
