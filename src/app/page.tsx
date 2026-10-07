import { CaseLeaderboardPage } from "@/components/case-leaderboard-page";
import { DataSchema, deriveView } from "@/lib/schema";
import data from "@/lib/data.json";

// Server component in a static export: parsing runs once at build time.
const cases = deriveView(DataSchema.parse(data));

export default function Home() {
  return <CaseLeaderboardPage cases={cases} />;
}
