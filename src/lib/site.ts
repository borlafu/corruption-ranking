import data from "@/lib/data.json";
import changelog from "@/lib/changelog.json";

/** Canonical origin. Every absolute URL — canonical, og:url, robots, sitemap — derives from it. */
export const SITE_URL = "https://corruption-ranking.web.app";

export const SITE_NAME = "España Corrupta";

export const META_MAX = 155;

/** Cuts a meta description to what search results show, with an ellipsis when cut. */
export const clampDescription = (text: string): string =>
  text.length <= META_MAX ? text : `${text.slice(0, META_MAX - 1).trimEnd()}…`;

/** Main page title, also the share card's alt text. */
export const SITE_TITLE = `Políticos imputados y condenados por corrupción | ${SITE_NAME}`;

/**
 * Year the oldest record entered its cause. Derived, not the scope date: a cause still open or
 * resolved since 2018 can have started years before.
 */
export const FIRST_YEAR: number = Math.min(...data.map((s) => s.startYear));

/** One description for the meta tag, the Open Graph card and the JSON-LD. ~150 chars. */
export const SITE_DESCRIPTION =
  `Políticos y cargos investigados, procesados y condenados por corrupción en España desde ${FIRST_YEAR}, ` +
  "de todos los partidos: causas, penas, indultos y fuentes.";

/** The data controller and privacy contact that /cookies and /privacidad publish (GDPR art. 13). */
export const OWNER_NAME = "Borja Lafuente";
export const PRIVACY_EMAIL = "borlafu+gdpr@gmail.com";

/**
 * Newest `lastUpdated` across suspects: the site's content date, for the sitemap and the
 * JSON-LD. Read off the raw JSON — `DataSchema.parse` in page.tsx and `validate-data` are
 * the validation boundary, so a second parse here would buy nothing.
 */
export const lastUpdatedISO: string = data.map((s) => s.lastUpdated).sort().at(-1) ?? "";

/** Date of the newest data run, changed records or not: entries are newest first. */
export const lastReviewedISO: string = changelog[0]?.date ?? "";

/**
 * The share card `src/app/opengraph-image.tsx` renders. The root picks it up by file convention;
 * pages that set their own `openGraph` replace the layout's whole object, so they name it here.
 */
export const OG_IMAGE = "/opengraph-image";
