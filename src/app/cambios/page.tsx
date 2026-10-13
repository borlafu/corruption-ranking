import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChangelogHashOpen } from "@/components/changelog-hash-open";
import { SourceList } from "@/components/source-list";
import { DataSchema } from "@/lib/schema";
import { changelog, countLine } from "@/lib/changelog";
import { KIND_LABEL, entryId, formatDate, statusConfig } from "@/lib/status-ui";
import { badgeVariants } from "@/components/ui/badge";
import { SITE_NAME } from "@/lib/site";
import data from "@/lib/data.json";

// Server component in a static export: parsed once at build time, like the root page.
const names = new Map(DataSchema.parse(data).map((s) => [s.id, s.suspect]));

const title = `Registro de cambios — ${SITE_NAME}`;
const description =
  "Qué cambió en cada actualización de los datos, por qué, qué se descartó y qué causas quedan pendientes de resolución.";

export const metadata: Metadata = {
  title,
  description,
  // The layout's canonical is the root; this page is its own document.
  alternates: { canonical: "/cambios", types: { "application/rss+xml": "/cambios/feed.xml" } },
  openGraph: { url: "/cambios", title, description },
  twitter: { card: "summary", title, description },
};

const linkClass =
  "text-primary hover:underline underline-offset-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const longDate = (date: string) => formatDate(date, { day: "numeric", month: "long", year: "numeric" });

function Suspects({ ids }: { ids: number[] }) {
  if (ids.length === 0) return null;
  return (
    <span>
      {ids.map((id, i) => (
        <span key={id}>
          {i > 0 && ", "}
          <Link href={`/#s-${id}`} className={linkClass}>
            {names.get(id) ?? `#${id}`}
          </Link>
        </span>
      ))}
      {": "}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</h3>
      {children}
    </section>
  );
}

const summaryClass =
  "flex cursor-pointer list-none items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden";

/** Disclosure marker for every <details> here; its <details> must carry `group`. */
function Chevron({ className = "" }: { className?: string }) {
  return <ChevronRight aria-hidden className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90", className)} />;
}

export default function ChangelogPage() {
  const dateLinks = (
    <ul className="mt-2 space-y-1 text-sm lg:max-h-[70vh] lg:overflow-y-auto">
      {changelog.map((e) => (
        <li key={e.date}>
          <a href={`#${entryId(e.date)}`} className={linkClass}>
            <time dateTime={e.date}>{longDate(e.date)}</time>
          </a>
        </li>
      ))}
    </ul>
  );
  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <ChangelogHashOpen />
      <header className="mb-8 text-center">
        <p className="font-headline text-3xl font-bold uppercase tracking-wider">
          <Link href="/" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            España <span className="text-primary">Corrupta</span>
          </Link>
        </p>
        <h1 className="font-headline text-4xl lg:text-5xl font-bold uppercase tracking-wider mt-4">Registro de cambios</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
        <p className="text-xs mt-2">
          <a href="/cambios/feed.xml" className={linkClass}>
            Suscríbete por RSS
          </a>
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8 lg:items-start">
        <nav aria-label="Actualizaciones" className="mb-6 lg:mb-0 lg:sticky lg:top-6">
          <details className="group rounded-lg border bg-card/80 p-4 lg:hidden">
            <summary className={cn(summaryClass, "text-sm font-semibold uppercase tracking-wide text-muted-foreground")}>
              <Chevron />
              Actualizaciones
            </summary>
            {dateLinks}
          </details>
          <div className="hidden lg:block rounded-lg border bg-card/80 p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Actualizaciones</p>
            {dateLinks}
          </div>
        </nav>

        <div className="space-y-6">
          {changelog.map((entry, index) => (
            <details
              key={entry.date}
              id={entryId(entry.date)}
              open={index === 0}
              className="group scroll-mt-6 rounded-lg border bg-card/80 shadow-lg"
            >
              <summary className={cn(summaryClass, "items-start gap-3 p-5 rounded-lg")}>
                <Chevron className="mt-2.5" />
                <div>
                  <h2 className="font-headline text-2xl font-bold">
                    <time dateTime={entry.date}>{longDate(entry.date)}</time>
                  </h2>
                  <span className="block text-sm text-muted-foreground">{countLine(entry)}</span>
                </div>
              </summary>
              <div className="px-5 pb-5">
                <p>{entry.summary}</p>
            <Section title="Cambios en los registros">
              {entry.changes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Revisión sin cambios en los registros.</p>
              ) : (
                <ul className="space-y-3">
                  {entry.changes.map((c, i) => (
                    <li key={i} className="text-sm">
                      <span className="mr-2 text-xs font-semibold uppercase text-muted-foreground">{KIND_LABEL[c.kind]}</span>
                      <Suspects ids={c.ids} />
                      {c.description}
                      {c.statusChange && (
                        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="text-muted-foreground">{c.statusChange.cause}:</span>
                          <span className={`${badgeVariants({ variant: "outline" })} ${statusConfig[c.statusChange.from].className}`}>
                            {statusConfig[c.statusChange.from].label}
                          </span>
                          <span aria-hidden>→</span>
                          <span className="sr-only">pasa a</span>
                          <span className={`${badgeVariants({ variant: "outline" })} ${statusConfig[c.statusChange.to].className}`}>
                            {statusConfig[c.statusChange.to].label}
                          </span>
                        </p>
                      )}
                      {c.rationale && <p className="mt-1 text-muted-foreground">Motivo: {c.rationale}</p>}
                      {c.sourceUrls && c.sourceUrls.length > 0 && (
                        <div className="mt-1">
                          <SourceList urls={c.sourceUrls} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            {entry.notAdded.length > 0 && (
              <Section title="Descartados">
                <ul className="space-y-2 text-sm">
                  {entry.notAdded.map((n, i) => (
                    <li key={i}>
                      <strong>{n.who}</strong>
                      {n.cause && <> ({n.cause})</>}: {n.reason}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {entry.unverifiable.length > 0 && (
              <Section title="Sin novedades verificables">
                <p className="text-sm">{entry.unverifiable.join(", ")}.</p>
              </Section>
            )}

            {entry.watchlist.length > 0 && (
              <Section title="En seguimiento">
                <ul className="space-y-2 text-sm">
                  {entry.watchlist.map((w, i) => (
                    <li key={i}>
                      <Suspects ids={w.ids} />
                      {w.text}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

              </div>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
