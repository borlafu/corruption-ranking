import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityPage, byStatusThenName } from "@/components/entity-page";
import { DataSchema, deriveView } from "@/lib/schema";
import { describeCause, findCause, slug } from "@/lib/filters";
import { OG_IMAGE, SITE_NAME, clampDescription } from "@/lib/site";
import { causePath } from "@/lib/suspects";
import data from "@/lib/data.json";

const cases = deriveView(DataSchema.parse(data));

export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = new Set(cases.flatMap((c) => c.causes.map((k) => slug(k.name))));
  return [...slugs].map((s) => ({ slug: s }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cause = findCause(cases, (await params).slug);
  if (!cause) return {};

  const title = `${cause.name}: investigados, procesados y condenados | ${SITE_NAME}`;
  const description = clampDescription(`${cause.name}: ${describeCause(cause)}`);
  const path = causePath(cause.name);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { url: path, title, description, images: OG_IMAGE },
    twitter: { card: "summary_large_image", title, description, images: OG_IMAGE },
  };
}

/** Everyone in one cause, each with their status in that cause — not their worst overall. */
export default async function CausePage({ params }: Props) {
  const cause = findCause(cases, (await params).slug);
  if (!cause) notFound();

  return (
    <EntityPage
      title={cause.name}
      path={causePath(cause.name)}
      members={[...cause.members].sort(byStatusThenName)}
    >
      <p className="mb-6 text-muted-foreground leading-relaxed">{describeCause(cause)}</p>
    </EntityPage>
  );
}
