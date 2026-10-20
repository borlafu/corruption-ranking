import type { MetadataRoute } from "next";
import { DataSchema } from "@/lib/schema";
import { SITE_URL, lastReviewedISO, lastUpdatedISO } from "@/lib/site";
import { causePath, partyPath, suspectPath } from "@/lib/suspects";
import data from "@/lib/data.json";

// Required by `output: 'export'`: metadata routes are routes, so they must opt into static.
export const dynamic = "force-static";

// The root, the changelog, one entry per cause and party page, and one per suspect page. The filter URLs are query strings on
// the root and all canonicalise to it, so they are deliberately absent. Emitted as a static
// /sitemap.xml.
export default function sitemap(): MetadataRoute.Sitemap {
  const records = DataSchema.parse(data);
  const suspects = records.map((s) => ({
    url: `${SITE_URL}${suspectPath(s.suspect)}`,
    lastModified: s.lastUpdated,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // A group page changes when any of its members does.
  const newest = new Map<string, string>();
  const touch = (path: string, date: string) => newest.set(path, [newest.get(path) ?? "", date].sort()[1]);
  for (const s of records) {
    for (const k of s.causes) touch(causePath(k.name), s.lastUpdated);
    if (s.party) touch(partyPath(s.party), s.lastUpdated);
  }
  const groups = [...newest].map(([path, lastModified]) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: `${SITE_URL}/`, lastModified: lastUpdatedISO, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/cambios`, lastModified: lastReviewedISO, changeFrequency: "weekly", priority: 0.5 },
    ...groups,
    ...suspects,
  ];
}
