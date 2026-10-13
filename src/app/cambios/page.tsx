import type { Metadata } from "next";
import Link from "next/link";
import { ChangelogHashOpen } from "@/components/changelog-hash-open";
import { SourceList } from "@/components/source-list";
import { ChangelogSchema, DataSchema, type ChangeKind, type ChangelogEntry } from "@/lib/schema";
import { formatDate } from "@/lib/status-ui";
import { SITE_NAME } from "@/lib/site";
import changelogData from "@/lib/changelog.json";
import data from "@/lib/data.json";

// Server component in a static export: parsed once at build time, like the root page.
const changelog = ChangelogSchema.parse(changelogData);
const names = new Map(DataSchema.parse(data).map((s) => [s.id, s.suspect]));

const title = `Registro de cambios — ${SITE_NAME}`;
const description =
  "Qué cambió en cada actualización de los datos, por qué, qué se descartó y qué causas quedan pendientes de resolución.";

export const metadata: Metadata = {
  title,
  description,
  // The layout's canonical is the root; this page is its own document.
  alternates: { canonical: "/cambios" },
  openGraph: { url: "/cambios", title, description },
};

const KIND_LABEL: Record<ChangeKind, string> = { nuevo: "Alta", actualizado: "Actualización", eliminado: "Baja" };

const linkClass =
  "text-primary hover:underline underline-offset-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const longDate = (date: string) => formatDate(date, { day: "numeric", month: "long", year: "numeric" });
const entryId = (date: string) => `r-${date}`;

/** Distinct records touched by a kind; id-less changes (bajas) count one each. */
function countKind(entry: ChangelogEntry, kind: ChangeKind) {
  const changes = entry.changes.filter((c) => c.kind === kind);
  return new Set(changes.flatMap((c) => c.ids)).size + changes.filter((c) => c.ids.length === 0).length;
}

function countLine(entry: ChangelogEntry) {
  const [altas, updates, bajas] = (["nuevo", "actualizado", "eliminado"] as const).map((k) => countKind(entry, k));
  const parts = [
    altas && `${altas} ${altas === 1 ? "alta" : "altas"}`,
    updates && `${updates} ${updates === 1 ? "registro actualizado" : "registros actualizados"}`,
    bajas && `${bajas} ${bajas === 1 ? "baja" : "bajas"}`,
    entry.notAdded.length > 0 && `${entry.notAdded.length} ${entry.notAdded.length === 1 ? "descartado" : "descartados"}`,
    entry.watchlist.length > 0 && `${entry.watchlist.length} en seguimiento`,
  ].filter(Boolean);
  return [...(altas || updates || bajas ? [] : ["sin cambios en los registros"]), ...parts].join(" · ");
}

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
  "cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

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
      </header>

      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8 lg:items-start">
        <nav aria-label="Actualizaciones" className="mb-6 lg:mb-0 lg:sticky lg:top-6">
          <details className="rounded-lg border bg-card/80 p-4 lg:hidden">
            <summary className={`${summaryClass} text-sm font-semibold uppercase tracking-wide text-muted-foreground`}>Actualizaciones</summary>
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
              <summary className="flex cursor-pointer list-none items-start gap-3 p-5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                <span aria-hidden className="mt-2 text-muted-foreground transition-transform group-open:rotate-90">▸</span>
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
