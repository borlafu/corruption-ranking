import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { formatDate } from "@/lib/status-ui";

export const linkClass =
  "text-primary hover:underline underline-offset-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Each legal page is its own document: without its own canonical it would inherit the root's. */
export function legalMetadata(path: string, heading: string, description: string): Metadata {
  const title = `${heading} — ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { url: path, title, description },
    twitter: { card: "summary", title, description },
  };
}

/** Shell shared by /cookies and /privacidad: site link, heading, revision date, prose. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <header className="mb-8 text-center">
        <p className="font-headline text-3xl font-bold uppercase tracking-wider">
          <Link href="/" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            España <span className="text-primary">Corrupta</span>
          </Link>
        </p>
        <h1 className="font-headline text-4xl lg:text-5xl font-bold uppercase tracking-wider mt-4">{title}</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Última actualización:{" "}
          <time dateTime={updated}>{formatDate(updated, { day: "numeric", month: "long", year: "numeric" })}</time>
        </p>
      </header>

      <article className="space-y-4 rounded-lg border bg-card/80 p-6 shadow-lg leading-relaxed [&_h2]:pt-4 [&_h2]:font-headline [&_h2]:text-xl [&_h2]:uppercase [&_h2]:tracking-wide [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </article>
    </main>
  );
}
