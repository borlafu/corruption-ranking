import { slug, type Filters } from "@/lib/filters";
import type { Party, Suspect } from "@/lib/schema";

/**
 * URL key for a suspect: "Álvaro García Ortiz" -> "alvaro-garcia-ortiz". `DataSchema` already
 * rejects duplicate normalized names, and `validate-data` additionally rejects two names that
 * collapse to the same slug, so this is unique across the dataset.
 */
export const suspectSlug = (suspect: string): string => slug(suspect);

/** Canonical path of a suspect's own page. */
export const suspectPath = (suspect: string): string => `/sospechoso/${suspectSlug(suspect)}`;

/** Canonical path of a cause's own page, keyed like the `caso` filter. */
export const causePath = (cause: string): string => `/caso/${slug(cause)}`;

/** Canonical path of a party's own page. Party ids are already URL-safe. */
export const partyPath = (party: Party): string => `/partido/${party}`;

/**
 * The standalone page a filter has, if any: one cause, or one party, and nothing else. Every other
 * combination only exists as a query string on the leaderboard.
 */
export function pagePath(f: Filters): string | undefined {
  if (Object.keys(f).length !== 1) return undefined;
  if (f.caso) return `/caso/${f.caso}`;
  if (f.partido?.length === 1) return partyPath(f.partido[0]);
  return undefined;
}

/** id -> path, for links that carry only an id (related suspects, changelog entries). */
export const suspectPaths = (suspects: readonly Pick<Suspect, "id" | "suspect">[]): Record<number, string> =>
  Object.fromEntries(suspects.map((s) => [s.id, suspectPath(s.suspect)]));

/** Slugs that more than one suspect would share. Empty = every slug is unique. */
export function slugCollisions(suspects: readonly Pick<Suspect, "suspect">[]): string[] {
  const seen = new Map<string, number>();
  for (const s of suspects) {
    const key = suspectSlug(s.suspect);
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  return [...seen].filter(([, count]) => count > 1).map(([key]) => key);
}
