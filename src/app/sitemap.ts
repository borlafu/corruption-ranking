import type { MetadataRoute } from "next";
import { DataSchema } from "@/lib/schema";
import { SITE_URL, lastReviewedISO, lastUpdatedISO } from "@/lib/site";
import { suspectPath } from "@/lib/suspects";
import data from "@/lib/data.json";

// Required by `output: 'export'`: metadata routes are routes, so they must opt into static.
export const dynamic = "force-static";

// The root, the changelog, and one entry per suspect page. The filter URLs are query strings on
// the root and all canonicalise to it, so they are deliberately absent. Emitted as a static
// /sitemap.xml.
export default function sitemap(): MetadataRoute.Sitemap {
  const suspects = DataSchema.parse(data).map((s) => ({
    url: `${SITE_URL}${suspectPath(s.suspect)}`,
    lastModified: s.lastUpdated,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: `${SITE_URL}/`, lastModified: lastUpdatedISO, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/cambios`, lastModified: lastReviewedISO, changeFrequency: "weekly", priority: 0.5 },
    ...suspects,
  ];
}
