import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { badgeVariants } from "@/components/ui/badge";
import { CaseDetailRow } from "@/components/case-detail-row";
import { StaticNav } from "@/components/static-nav";
import { DataSchema, deriveView, type SuspectView } from "@/lib/schema";
import { changelog } from "@/lib/changelog";
import { formatDate, partyLabel, statusConfig } from "@/lib/status-ui";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { suspectPath, suspectPaths, suspectSlug } from "@/lib/suspects";
import data from "@/lib/data.json";

// Parsed once at build time, like the other pages; every slug is prerendered.
const cases = deriveView(DataSchema.parse(data), changelog);
const bySlug = new Map(cases.map((c) => [suspectSlug(c.suspect), c]));
const pathsById = suspectPaths(cases);

// A static export serves only the slugs below, so an unknown one is a 404 rather than a build-time
// render.
export const dynamicParams = false;

export function generateStaticParams() {
  return [...bySlug.keys()].map((slug) => ({ slug }));
}

const META_MAX = 155;

const clamp = (text: string): string =>
  text.length <= META_MAX ? text : `${text.slice(0, META_MAX - 1).trimEnd()}…`;

/** Built from the record itself, so it describes this page and no other. */
function describe(c: SuspectView): string {
  const causes = c.causes.map((k) => k.name).join(", ");
  // Keeps the badge's "Condenado/a" form: the data carries no gender, so any single form would be
  // wrong for part of the dataset.
  const status = statusConfig[c.status].label;
  const plural = c.causes.length === 1 ? "causa" : "causas";
  const head = `${c.suspect}, ${c.title}. ${status} en ${c.causes.length} ${plural}: ${causes}.`;
  // The court is the one fact that lifts the short records into the 120-160 window.
  const tail = c.court ? ` ${c.court}.` : "";
  return clamp(head.length + tail.length <= META_MAX ? head + tail : head);
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = bySlug.get(slug);
  if (!c) return {};

  const title = `${c.suspect}: causas judiciales — ${SITE_NAME}`;
  const description = describe(c);
  const path = suspectPath(c.suspect);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "profile", url: path, title, description },
    twitter: { card: "summary", title, description },
  };
}

/**
 * The record's own page. The leaderboard shows this same detail on click, which a crawler never
 * performs, so this is where the causes, charges, sentences and sources are actually indexable.
 */
export default async function SuspectPage({ params }: Props) {
  const { slug } = await params;
  const c = bySlug.get(slug);
  if (!c) notFound();

  const status = statusConfig[c.status];
  const path = suspectPath(c.suspect);
  // Only the ids reachable from this page, so the whole map does not ride along in the payload.
  const paths = Object.fromEntries(c.relatedIds.map((id) => [id, pathsById[id]]));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      url: `${SITE_URL}${path}`,
      inLanguage: "es",
      dateModified: c.lastUpdated,
      // Identity only: the causes themselves are in the page text, not asserted as schema claims.
      mainEntity: {
        "@type": "Person",
        name: c.suspect,
        jobTitle: c.title,
        ...(c.party && { memberOf: { "@type": "Organization", name: partyLabel[c.party] } }),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
        { "@type": "ListItem", position: 2, name: c.suspect },
      ],
    },
  ];

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mb-8">
        <p className="font-headline text-2xl font-bold uppercase tracking-wider text-center">
          <Link href="/" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            España <span className="text-primary">Corrupta</span>
          </Link>
        </p>
        <h1 className="font-headline text-4xl lg:text-5xl font-bold uppercase tracking-wider mt-6 text-center">
          {c.suspect}
        </h1>
        <p className="text-muted-foreground mt-2 text-center">{c.title}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className={`${badgeVariants({ variant: "outline" })} ${status.className}`}>{status.label}</span>
          {c.party && <span className={badgeVariants({ variant: "outline" })}>{partyLabel[c.party]}</span>}
          <span className="text-muted-foreground">
            Año <time dateTime={String(c.startYear)}>{c.startYear}</time>
          </span>
        </div>
      </header>

      <div className="rounded-lg border bg-card/80 shadow-lg overflow-hidden">
        <StaticNav paths={paths}>
          <CaseDetailRow caseData={c} allCases={cases} />
        </StaticNav>
      </div>

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Última actualización: <time dateTime={c.lastUpdated}>{formatDate(c.lastUpdated, { day: "numeric", month: "long", year: "numeric" })}</time>
        </p>
        <p className="mt-2">
          <Link
            href="/"
            className="text-primary hover:underline underline-offset-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ver el marcador completo
          </Link>
        </p>
      </footer>
    </main>
  );
}
