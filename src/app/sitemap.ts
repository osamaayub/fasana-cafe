import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/menu", "/reserve", "/about", "/contact"].map((p) => ({
    url: `${siteUrl}${p}`,
    changeFrequency: p === "/menu" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));
}
