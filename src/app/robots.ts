import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Required by `output: 'export'`: metadata routes are routes, so they must opt into static.
export const dynamic = "force-static";

// Emitted as a static /robots.txt.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
