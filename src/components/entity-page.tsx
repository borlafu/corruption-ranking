import Link from "next/link";
import { badgeVariants } from "@/components/ui/badge";
import { StatusCounts } from "@/components/case-banner";
import { STATUS_SEVERITY, formatPenalty, type Cause, type CaseStatus, type SuspectView } from "@/lib/schema";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { clemencyLabel, formatDate, partyLabel, statusConfig } from "@/lib/status-ui";
import { causePath, partyPath, suspectPath } from "@/lib/suspects";

/**
 * A suspect as listed on a cause or party page, with the status that page is about. A cause page
 * also passes the member's record of that cause, shown as charges, sentence and summary.
 */
export type Member = { suspect: SuspectView; status: CaseStatus; cause?: Cause };

const linkClass =
  "rounded-sm hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Most severe first, then by name, so the order is stable between builds. */
export const byStatusThenName = (a: Member, b: Member): number =>
  STATUS_SEVERITY.indexOf(a.status) - STATUS_SEVERITY.indexOf(b.status) ||
  a.suspect.suspect.localeCompare(b.suspect.suspect, "es");

type Props = {
  title: string;
  path: string;
  /** One line under the title. */
  subtitle?: React.ReactNode;
  members: Member[];
  children?: React.ReactNode;
};

/**
 * Page for a group of suspects — one cause or one party. Plain links throughout: these pages exist
 * so a crawler can reach each group, and the leaderboard's filters are invisible to it.
 */
export function EntityPage({ title, path, subtitle, members, children }: Props) {
  const lastUpdated = members.map((m) => m.suspect.lastUpdated).sort().at(-1) ?? "";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: title, item: `${SITE_URL}${path}` },
    ],
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <header className="mb-8 text-center">
        <p className="font-headline text-2xl font-bold uppercase tracking-wider">
          <Link href="/" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            España <span className="text-primary">Corrupta</span>
          </Link>
        </p>
        <h1 className="font-headline text-4xl lg:text-5xl font-bold uppercase tracking-wider mt-6">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
          <StatusCounts statuses={members.map((m) => m.status)} />
        </div>
      </header>

      {children}

      <ul className="rounded-lg border bg-card/80 shadow-lg divide-y divide-border/40">
        {members.map(({ suspect: s, status, cause }) => (
          <li key={s.id} className="p-4 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={suspectPath(s.suspect)} className={`font-semibold ${linkClass}`}>
                {s.suspect}
              </Link>
              <span className={`${badgeVariants({ variant: "outline" })} ${statusConfig[status].className}`}>
                {statusConfig[status].label}
              </span>
              {s.party && (
                <Link href={partyPath(s.party)} className={`${badgeVariants({ variant: "outline" })} hover:bg-muted`}>
                  {partyLabel[s.party]}
                </Link>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{s.title}</p>
            {cause && <CauseRecord cause={cause} summary={s.summary} />}
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
              {s.causes.map((k) => (
                <Link key={k.name} href={causePath(k.name)} className={linkClass}>
                  {k.name}
                </Link>
              ))}
            </p>
          </li>
        ))}
      </ul>

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        {lastUpdated && (
          <p>
            Última actualización:{" "}
            <time dateTime={lastUpdated}>{formatDate(lastUpdated, { day: "numeric", month: "long", year: "numeric" })}</time>
          </p>
        )}
        <p className="mt-2">
          <Link href="/" className={`text-primary ${linkClass}`}>
            Ver todos los casos
          </Link>
        </p>
      </footer>
    </main>
  );
}

/** One member's record of the cause the page is about. */
function CauseRecord({ cause, summary }: { cause: Cause; summary?: string }) {
  const convicted = new Set(cause.convictions ?? []);
  return (
    <div className="space-y-1 text-sm">
      <p>
        <span className="text-muted-foreground">Delitos: </span>
        {cause.charges.map((crime, i) => (
          <span key={crime}>
            {i > 0 && ", "}
            {convicted.has(crime) ? <strong>{crime} (condena)</strong> : crime}
          </span>
        ))}
      </p>
      {cause.sentence && (
        <p>
          <span className="text-muted-foreground">Pena: </span>
          {formatPenalty(cause.sentence)} · {formatDate(cause.sentence.date)}
          {cause.clemency?.map((cl) => ` · ${clemencyLabel(cl)}`)}
        </p>
      )}
      {summary && <p className="text-muted-foreground leading-relaxed">{summary}</p>}
    </div>
  );
}
