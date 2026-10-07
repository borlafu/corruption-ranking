import { CATEGORIES, CRIMES, normalize, type Allegiance, type CaseStatus, type Crime, type SuspectView } from "@/lib/schema";

/** Table filters. Every field maps 1:1 to a URL query param of the same name. */
export type Filters = { cat?: Allegiance; anio?: number; delito?: Crime; caso?: string; q?: string };

const KEYS = ["cat", "anio", "delito", "caso", "q"] as const satisfies readonly (keyof Filters)[];

/** URL-safe key for a cause name: "Caso Ábalos/Koldo" -> "caso-abalos-koldo". */
export const slug = (text: string): string => normalize(text).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const isCategory = (v: string | null): v is Allegiance => (CATEGORIES as readonly string[]).includes(v ?? "");
const isCrime = (v: string | null): v is Crime => (CRIMES as readonly string[]).includes(v ?? "");

/** Reads filters from a query string; unknown or malformed values are dropped. */
export function parseFilters(search: string): Filters {
  const p = new URLSearchParams(search);
  const cat = p.get("cat");
  const delito = p.get("delito");
  const caso = p.get("caso");
  const anio = Number(p.get("anio"));
  const q = p.get("q")?.trim();
  return {
    ...(isCategory(cat) && { cat }),
    ...(Number.isInteger(anio) && anio > 0 && { anio }),
    ...(isCrime(delito) && { delito }),
    ...(caso && /^[a-z0-9-]+$/.test(caso) && { caso }),
    ...(q && { q }),
  };
}

/** Query string for the given filters, "" when none are set. */
export function toSearch(f: Filters): string {
  const p = new URLSearchParams();
  for (const k of KEYS) if (f[k] !== undefined && f[k] !== "") p.set(k, String(f[k]));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const hasFilters = (f: Filters): boolean => KEYS.some((k) => f[k] !== undefined && f[k] !== "");

export function filterCases(cases: SuspectView[], f: Filters): SuspectView[] {
  const q = f.q ? normalize(f.q) : "";
  return cases.filter(
    (c) =>
      (!f.cat || c.categories.includes(f.cat)) &&
      (!f.anio || c.startYear === f.anio) &&
      (!f.delito || c.crimes.includes(f.delito)) &&
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
  const members = cases.flatMap((s) =>
    s.causes.filter((k) => slug(k.name) === caso).map((k) => ({ suspect: s, cause: k }))
  );
  if (members.length === 0) return undefined;
  const { cause } = members[0];
  return {
    name: cause.name,
    amount: cause.amount,
    members: members.map(({ suspect, cause: k }) => ({ suspect, status: k.status })),
  };
}
