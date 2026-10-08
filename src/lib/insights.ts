import { PARTIES, STATUSES, type CaseStatus, type Party, type SuspectView } from "@/lib/schema";

/** Series key for suspects with no party in the dataset. */
export const NO_PARTY = "sin";

export type PartyKey = Party | typeof NO_PARTY;

/** One stacked column: the year plus a count per party series. */
export type YearRow = { year: number } & Partial<Record<PartyKey, number>>;

/** Suspect counts per worst status. Zero rows are kept so the axis stays stable across filters. */
export function statusCounts(cases: SuspectView[]): { status: CaseStatus; count: number }[] {
  return STATUSES.map((status) => ({ status, count: cases.filter((c) => c.status === status).length }));
}

/**
 * Suspects per start year, split by party. Years with no suspect are filled with
 * zeros so the gaps in the data do not distort the time axis; `keys` holds only
 * the series that actually occur, in PARTIES order.
 */
export function yearPartyRows(cases: SuspectView[]): { rows: YearRow[]; keys: PartyKey[] } {
  if (cases.length === 0) return { rows: [], keys: [] };

  const keyOf = (c: SuspectView): PartyKey => c.party ?? NO_PARTY;
  const present = new Set(cases.map(keyOf));
  const keys: PartyKey[] = [
    ...PARTIES.filter((p) => present.has(p)),
    ...(present.has(NO_PARTY) ? ([NO_PARTY] as const) : []),
  ];

  const years = cases.map((c) => c.startYear);
  const first = Math.min(...years);
  const span = Math.max(...years) - first + 1;

  const rows = Array.from({ length: span }, (_, i) => {
    const year = first + i;
    const inYear = cases.filter((c) => c.startYear === year);
    return {
      year,
      ...Object.fromEntries(keys.map((key) => [key, inYear.filter((c) => keyOf(c) === key).length])),
    } as YearRow;
  });

  return { rows, keys };
}
