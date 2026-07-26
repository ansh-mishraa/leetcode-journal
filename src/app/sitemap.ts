import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["", "/try", "/login", "/signup", "/status", "/privacy", "/terms"];

  return routes.map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified: now,
    changeFrequency: path === "" || path === "/try" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/try" ? 0.9 : 0.5,
  }));
}
