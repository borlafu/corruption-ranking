import type { MetadataRoute } from "next";
import { SITE_URL, lastUpdatedISO } from "@/lib/site";

// Required by `output: 'export'`: metadata routes are routes, so they must opt into static.
export const dynamic = "force-static";

// One page, one entry: the filter URLs are query strings on this same page and all canonicalise
// to it. Emitted as a static /sitemap.xml.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, lastModified: lastUpdatedISO, changeFrequency: "weekly", priority: 1 }];
}
