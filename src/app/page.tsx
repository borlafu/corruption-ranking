import { CaseLeaderboardPage } from "@/components/case-leaderboard-page";
import { DataSchema, deriveView } from "@/lib/schema";
import { formatDate } from "@/lib/status-ui";
import data from "@/lib/data.json";

// Server component in a static export: parsing and formatting run once at build time.
const cases = deriveView(DataSchema.parse(data));
const newest = cases.map((c) => c.lastUpdated).sort().at(-1);
const lastUpdated = newest ? formatDate(newest, { day: "numeric", month: "long", year: "numeric" }) : "";

export default function Home() {
  return <CaseLeaderboardPage cases={cases} lastUpdated={lastUpdated} />;
}
