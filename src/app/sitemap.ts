import type { MetadataRoute } from "next";
import { siteUrl } from "@lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [
    ["", 1],
    ["/menu", 0.9],
    ["/reserve", 0.9],
    ["/gallery", 0.6],
    ["/about", 0.7],
    ["/faq", 0.5],
    ["/contact", 0.7],
    ["/privacy", 0.2],
  ];
  return pages.map(([p, priority]) => ({
    url: `${siteUrl}${p}`,
    changeFrequency: p === "/menu" ? "weekly" : "monthly",
    priority,
  }));
}
