import data from "@/lib/data.json";
import changelog from "@/lib/changelog.json";

/** Canonical origin. Every absolute URL — canonical, og:url, robots, sitemap — derives from it. */
export const SITE_URL = "https://corruption-ranking.web.app";

export const SITE_NAME = "España Corrupta";

/** One description for the meta tag, the Open Graph card and the JSON-LD. 144 chars. */
export const SITE_DESCRIPTION =
  "Marcador no oficial de los casos de corrupción en los tribunales españoles desde 2018: " +
  "investigados, procesados y condenados de todos los partidos.";

/** The data controller and privacy contact that /cookies and /privacidad publish (GDPR art. 13). */
export const OWNER_NAME = "Borja Lafuente";
export const PRIVACY_EMAIL = "borlafu+gdpr@gmail.com";

/** Dataset scope: causes open or resolved since this date (see CLAUDE.md). */
export const SCOPE_START = "2018-01-01";

/**
 * Newest `lastUpdated` across suspects: the site's content date, for the sitemap and the
 * JSON-LD. Read off the raw JSON — `DataSchema.parse` in page.tsx and `validate-data` are
 * the validation boundary, so a second parse here would buy nothing.
 */
export const lastUpdatedISO: string = data.map((s) => s.lastUpdated).sort().at(-1) ?? "";

/** Date of the newest data run, changed records or not: entries are newest first. */
export const lastReviewedISO: string = changelog[0]?.date ?? "";
