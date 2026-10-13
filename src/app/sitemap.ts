import type { MetadataRoute } from "next";
import { SITE_URL, lastReviewedISO, lastUpdatedISO } from "@/lib/site";

// Required by `output: 'export'`: metadata routes are routes, so they must opt into static.
export const dynamic = "force-static";

// The filter URLs are query strings on the root page and all canonicalise to it, so the root and
// the changelog are the only entries. Emitted as a static /sitemap.xml.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: lastUpdatedISO, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/cambios`, lastModified: lastReviewedISO, changeFrequency: "weekly", priority: 0.5 },
  ];
}
