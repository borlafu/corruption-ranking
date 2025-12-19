import { CaseLeaderboardPage } from "@/components/case-leaderboard-page";
import { Case } from "@/lib/types";
import initialCases from "@/lib/data.json";

export default function Home() {
  return <CaseLeaderboardPage cases={initialCases as Case[]} />;
}
