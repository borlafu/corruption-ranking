import type { Metadata } from "next";
import Link from "next/link";
import { SourceList } from "@/components/source-list";
import { ChangelogSchema, DataSchema, type ChangeKind } from "@/lib/schema";
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

export default function ChangelogPage() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <header className="mb-8 text-center">
        <p className="font-headline text-3xl font-bold uppercase tracking-wider">
          <Link href="/" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            España <span className="text-primary">Corrupta</span>
          </Link>
        </p>
        <h1 className="font-headline text-4xl lg:text-5xl font-bold uppercase tracking-wider mt-4">Registro de cambios</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </header>

      <div className="space-y-6">
        {changelog.map((entry) => (
          <article key={entry.date} className="rounded-lg border bg-card/80 p-5 shadow-lg">
            <h2 className="font-headline text-2xl font-bold">
              <time dateTime={entry.date}>{formatDate(entry.date, { day: "numeric", month: "long", year: "numeric" })}</time>
            </h2>
            <p className="mt-2">{entry.summary}</p>

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

          </article>
        ))}
      </div>
    </main>
  );
}
