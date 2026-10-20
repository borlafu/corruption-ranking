import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityPage, byStatusThenName, type Member } from "@/components/entity-page";
import { DataSchema, PARTIES, deriveView, type Party } from "@/lib/schema";
import { OG_IMAGE, SITE_NAME, clampDescription } from "@/lib/site";
import { partyLabel, statusCount, statusTally } from "@/lib/status-ui";
import { partyPath } from "@/lib/suspects";
import data from "@/lib/data.json";

const cases = deriveView(DataSchema.parse(data));

/** Each suspect with their worst status, the same one the leaderboard's Estado badge shows. */
const membersOf = (party: Party): Member[] =>
  cases.filter((c) => c.party === party).map((c) => ({ suspect: c, status: c.status })).sort(byStatusThenName);

const isParty = (s: string): s is Party => (PARTIES as readonly string[]).includes(s);

export const dynamicParams = false;

// Only parties with at least one record: an empty page would be a soft 404.
export function generateStaticParams() {
  return PARTIES.filter((p) => cases.some((c) => c.party === p)).map((p) => ({ slug: p }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isParty(slug)) return {};

  const label = partyLabel[slug];
  const members = membersOf(slug);
  const title = `${label}: causas judiciales por corrupción | ${SITE_NAME}`;
  const counts = statusTally(members.map((m) => m.status)).map(({ status, n }) => statusCount(status, n));
  const causes = [...new Set(members.flatMap((m) => m.suspect.causes.map((k) => k.name)))];
  const description = clampDescription(
    `${members.length} ${members.length === 1 ? "cargo" : "cargos"} del partido ${label} en causas judiciales por corrupción: ${counts.join(", ")}. ` +
      `${causes.join(", ")}.`,
  );
  const path = partyPath(slug);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { url: path, title, description, images: OG_IMAGE },
    twitter: { card: "summary_large_image", title, description, images: OG_IMAGE },
  };
}

export default async function PartyPage({ params }: Props) {
  const { slug } = await params;
  if (!isParty(slug)) notFound();

  return (
    <EntityPage
      title={partyLabel[slug]}
      path={partyPath(slug)}
      subtitle="Cargos y personas vinculadas al partido en causas judiciales por corrupción"
      members={membersOf(slug)}
    />
  );
}
