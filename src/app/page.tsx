import { CaseLeaderboardPage } from "@/components/case-leaderboard-page";
import { DataSchema, deriveView } from "@/lib/schema";
import { changelog } from "@/lib/changelog";
import { formatDate } from "@/lib/status-ui";
import { SCOPE_START, SITE_DESCRIPTION, SITE_NAME, SITE_URL, lastReviewedISO, lastUpdatedISO } from "@/lib/site";
import data from "@/lib/data.json";

// Server component in a static export: parsing and formatting run once at build time.
const cases = deriveView(DataSchema.parse(data), changelog);
const longDate = (iso: string) => (iso ? formatDate(iso, { day: "numeric", month: "long", year: "numeric" }) : "");
const lastUpdated = longDate(lastUpdatedISO);
const lastReviewed = longDate(lastReviewedISO);

/** The page *is* the dataset it describes, so the schema matches what is rendered. */
const datasetJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  inLanguage: "es",
  isAccessibleForFree: true,
  temporalCoverage: `${SCOPE_START}/..`,
  dateModified: lastUpdatedISO,
  keywords: ["corrupción", "España", "causas judiciales", "política", "sentencias"],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />
      <CaseLeaderboardPage cases={cases} lastUpdated={lastUpdated} lastReviewed={lastReviewed} />
    </>
  );
}
