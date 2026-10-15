import { slug } from "@/lib/filters";
import type { Suspect } from "@/lib/schema";

/**
 * URL key for a suspect: "Álvaro García Ortiz" -> "alvaro-garcia-ortiz". `DataSchema` already
 * rejects duplicate normalized names, and `validate-data` additionally rejects two names that
 * collapse to the same slug, so this is unique across the dataset.
 */
export const suspectSlug = (suspect: string): string => slug(suspect);

/** Canonical path of a suspect's own page. */
export const suspectPath = (suspect: string): string => `/sospechoso/${suspectSlug(suspect)}`;

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
