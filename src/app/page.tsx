import { CaseLeaderboardPage } from '@/components/case-leaderboard-page';
import { initialCases } from '@/lib/data';

export default function Home() {
  return <CaseLeaderboardPage cases={initialCases} />;
}
