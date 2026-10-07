import { z } from "zod";

/** Political allegiance of a suspect. A suspect may carry several. */
export const CATEGORIES = ["gobierno", "familia", "psoe", "institucional", "entorno"] as const;

/**
 * Legal status of one cause.
 * investigado = imputado/investigado by a court; procesado = auto de procesamiento or apertura de juicio oral;
 * condenado = convicted (appeal may be pending); absuelto = acquitted; sobreseido = archived/dismissed.
 * Querellas or denuncias alone do not qualify as investigado.
 */
export const STATUSES = ["investigado", "procesado", "condenado", "absuelto", "sobreseido"] as const;

/** Most serious first. Used to pick the badge shown in the table. */
const STATUS_SEVERITY: readonly CaseStatus[] = ["condenado", "procesado", "investigado", "absuelto", "sobreseido"];

const SUMMARY_MAX = 300;

export const CauseSchema = z.object({
  /** Canonical case name ("Caso Koldo"). Suspects sharing a name are related. */
  name: z.string().min(1),
  status: z.enum(STATUSES),
  /** Total EUR for the whole case, not per suspect. Same-name causes must agree. */
  amount: z.number().nonnegative().optional(),
});

export const SuspectSchema = z
  .object({
    id: z.number().int().positive(),
    suspect: z.string().min(1),
    /** Role description shown under the name. */
    title: z.string().min(1),
    categories: z.array(z.enum(CATEGORIES)).min(1),
    causes: z.array(CauseSchema).min(1),
    /** Distinct crimes (delitos) charged across all causes. */
    accusations: z.number().int().nonnegative(),
    /** Distinct crimes convicted of. Not the number of rulings. */
    sentences: z.number().int().nonnegative(),
    /** Date of the last content change. Never bump without a change. */
    lastUpdated: z.iso.date(),
    sourceUrls: z.array(z.url({ protocol: /^https$/ })).min(1),
    /** Court that issued the last ruling or is instructing. */
    court: z.string().optional(),
    startYear: z.number().int().min(1970).max(2040).optional(),
    summary: z.string().max(SUMMARY_MAX).optional(),
  })
  .superRefine((s, ctx) => {
    const issue = (message: string, path: string[] = []) =>
      ctx.addIssue({ code: "custom", message, path });
    if (new Set(s.sourceUrls).size !== s.sourceUrls.length) issue("duplicate sourceUrls", ["sourceUrls"]);
    if (s.sourceUrls.every((u) => /wikipedia\.org/.test(u))) issue("needs a non-wikipedia source", ["sourceUrls"]);
    const names = s.causes.map((c) => normalize(c.name));
    if (new Set(names).size !== names.length) issue("duplicate cause names", ["causes"]);
    if (s.sentences > s.accusations) issue("sentences > accusations", ["sentences"]);
    const convicted = s.causes.some((c) => c.status === "condenado");
    if (convicted !== s.sentences > 0) issue("sentences > 0 iff some cause is condenado", ["sentences"]);
  });

export const DataSchema = z.array(SuspectSchema).superRefine((all, ctx) => {
  const issue = (message: string) => ctx.addIssue({ code: "custom", message });
  const dupes = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) !== i);
  dupes(all.map((s) => String(s.id))).forEach((id) => issue(`duplicate id ${id}`));
  dupes(all.map((s) => normalize(s.suspect))).forEach((n) => issue(`duplicate suspect ${n}`));

  const amountsByCause = new Map<string, Set<number | undefined>>();
  for (const s of all)
    for (const c of s.causes) {
      const set = amountsByCause.get(normalize(c.name)) ?? new Set();
      set.add(c.amount);
      amountsByCause.set(normalize(c.name), set);
    }
  for (const [name, amounts] of amountsByCause)
    if (amounts.size > 1) issue(`cause "${name}" has differing amounts`);
});

export type Allegiance = (typeof CATEGORIES)[number];
export type CaseStatus = (typeof STATUSES)[number];
export type Cause = z.infer<typeof CauseSchema>;
export type Suspect = z.infer<typeof SuspectSchema>;

/** Suspect plus fields derived for the UI. */
export type SuspectView = Suspect & {
  status: CaseStatus;
  caseName: string;
  relatedIds: number[];
};

/** Lower-case, accent-stripped key for comparisons. */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function worstStatus(causes: Cause[]): CaseStatus {
  return STATUS_SEVERITY.find((st) => causes.some((c) => c.status === st)) ?? "sobreseido";
}

export function deriveView(suspects: Suspect[]): SuspectView[] {
  const keys = (s: Suspect) => s.causes.map((c) => normalize(c.name));
  return suspects.map((s) => {
    const mine = new Set(keys(s));
    return {
      ...s,
      status: worstStatus(s.causes),
      caseName: s.causes.map((c) => c.name).join(" / "),
      relatedIds: suspects.filter((o) => o.id !== s.id && keys(o).some((k) => mine.has(k))).map((o) => o.id),
    };
  });
}
