import { CATEGORIES, CRIMES, PARTIES, STATUSES, normalize, type Allegiance, type Party, type CaseStatus, type Crime, type SuspectView } from "@/lib/schema";

/**
 * Table filters. Every field maps 1:1 to a URL query param of the same name.
 * The facet fields hold several values, comma-joined in the URL: OR inside a
 * field, AND across fields.
 */
export type Filters = {
  cat?: Allegiance[];
  partido?: Party[];
  /** Matches the suspect's worst status, the one the Estado badge shows — not each cause's. */
  estado?: CaseStatus[];
  anio?: number[];
  delito?: Crime[];
  caso?: string;
  q?: string;
};

const KEYS = ["cat", "partido", "estado", "anio", "delito", "caso", "q"] as const satisfies readonly (keyof Filters)[];

/** URL-safe key for a cause name: "Caso Ábalos/Koldo" -> "caso-abalos-koldo". */
export const slug = (text: string): string => normalize(text).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const isSet = (value: Filters[keyof Filters]): boolean =>
  Array.isArray(value) ? value.length > 0 : value !== undefined && value !== "";

const unique = <T,>(xs: T[]): T[] => [...new Set(xs)];

/** Comma-separated param into trimmed, non-empty parts. */
const parts = (raw: string | null): string[] => (raw ?? "").split(",").map((s) => s.trim()).filter(Boolean);

/** Keeps only the parts belonging to an enum, deduped. */
const members = <T extends string>(raw: string | null, allowed: readonly T[]): T[] =>
  unique(parts(raw).filter((v): v is T => (allowed as readonly string[]).includes(v)));

/** Reads filters from a query string; unknown or malformed values are dropped. */
export function parseFilters(search: string): Filters {
  const p = new URLSearchParams(search);
  const rawCat = p.get("cat");
  const cat = members(rawCat, CATEGORIES);
  // Legacy links: PSOE used to be a category.
  const legacy: Party[] = parts(rawCat).includes("psoe") ? ["psoe"] : [];
  const partido = unique([...legacy, ...members(p.get("partido"), PARTIES)]);
  const estado = members(p.get("estado"), STATUSES);
  const anio = unique(parts(p.get("anio")).map(Number).filter((n) => Number.isInteger(n) && n > 0));
  const delito = members(p.get("delito"), CRIMES);
  const caso = p.get("caso");
  const q = p.get("q")?.trim();
  return {
    ...(cat.length > 0 && { cat }),
    ...(partido.length > 0 && { partido }),
    ...(estado.length > 0 && { estado }),
    ...(anio.length > 0 && { anio }),
    ...(delito.length > 0 && { delito }),
    ...(caso && /^[a-z0-9-]+$/.test(caso) && { caso }),
    ...(q && { q }),
  };
}

/** Query string for the given filters, "" when none are set. */
export function toSearch(f: Filters): string {
  const p = new URLSearchParams();
  for (const k of KEYS) {
    const v = f[k];
    if (isSet(v)) p.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  // Commas are legal in a query string and keep multi-value filters readable.
  const s = p.toString().replace(/%2C/g, ",");
  return s ? `?${s}` : "";
}

export const hasFilters = (f: Filters): boolean => KEYS.some((k) => isSet(f[k]));

/** Adds the values missing from `current` and removes the ones already there. */
const toggled = <T,>(current: readonly T[], values: readonly T[]): T[] =>
  values.reduce<T[]>((acc, v) => (acc.includes(v) ? acc.filter((x) => x !== v) : [...acc, v]), [...current]);

/**
 * Filters with `patch` applied. An array value *toggles* membership (every call
 * site is a chip or a link that should flip its own value); `undefined` or ""
 * clears the whole field; a scalar replaces it. Never mutates `f`.
 */
export function applyPatch(f: Filters, patch: Filters): Filters {
  const next: Record<string, unknown> = { ...f };
  for (const k of KEYS) {
    if (!(k in patch)) continue;
    const v = patch[k];
    if (!isSet(v)) delete next[k];
    else if (Array.isArray(v)) {
      const list = toggled((f[k] ?? []) as unknown[], v);
      if (list.length > 0) next[k] = list;
      else delete next[k];
    } else next[k] = v;
  }
  return next as Filters;
}

/** True when nothing is selected for this field, or one of the selected values matches. */
const anyOf = <T,>(selected: T[] | undefined, matches: (value: T) => boolean): boolean =>
  !selected?.length || selected.some(matches);

export function filterCases(cases: SuspectView[], f: Filters): SuspectView[] {
  const q = f.q ? normalize(f.q) : "";
  return cases.filter(
    (c) =>
      anyOf(f.cat, (cat) => c.categories.includes(cat)) &&
      anyOf(f.partido, (party) => c.party === party) &&
      anyOf(f.estado, (status) => c.status === status) &&
      anyOf(f.anio, (year) => c.startYear === year) &&
      anyOf(f.delito, (crime) => c.crimes.includes(crime)) &&
      (!f.caso || c.causes.some((k) => slug(k.name) === f.caso)) &&
      (!q || normalize([c.suspect, c.title, c.caseName, c.court ?? "", ...c.crimes].join(" ")).includes(q))
  );
}

export type CauseOverview = {
  name: string;
  amount?: number;
  members: { suspect: SuspectView; status: CaseStatus }[];
};

/** Everyone in one cause, with their status in that cause. Undefined if the slug matches nothing. */
export function findCause(cases: SuspectView[], caso: string): CauseOverview | undefined {
  const inCause = cases.flatMap((s) =>
    s.causes.filter((k) => slug(k.name) === caso).map((k) => ({ suspect: s, cause: k }))
  );
  if (inCause.length === 0) return undefined;
  const { cause } = inCause[0];
  return {
    name: cause.name,
    amount: cause.amount,
    members: inCause.map(({ suspect, cause: k }) => ({ suspect, status: k.status })),
  };
}
