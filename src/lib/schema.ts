import { z } from "zod";

/** Role of a suspect. A suspect may carry several. */
export const CATEGORIES = ["gobierno", "familia", "partido", "institucional", "entorno"] as const;

/** Party the suspect belonged to when the facts occurred. Add a value here rather than free text. */
export const PARTIES = ["psoe", "pp", "vox", "podemos", "sumar", "iu", "junts", "erc", "pnv", "cs"] as const;

/**
 * Legal status of one cause.
 * investigado = imputado/investigado by a court; procesado = auto de procesamiento or apertura de juicio oral;
 * condenado = convicted (appeal may be pending); absuelto = acquitted; sobreseido = archived/dismissed.
 * Querellas or denuncias alone do not qualify as investigado.
 */
export const STATUSES = ["investigado", "procesado", "condenado", "absuelto", "sobreseido"] as const;

/** Crimes (Código Penal), used as display strings. Add a value here rather than free text. */
export const CRIMES = [
  "cohecho",
  "malversación",
  "prevaricación",
  "tráfico de influencias",
  "organización criminal",
  "grupo criminal",
  "blanqueo de capitales",
  "falsedad documental",
  "revelación de secretos",
  "falso testimonio",
  "acusación falsa",
  "delito contra las instituciones del Estado",
  "obstrucción a la justicia",
  "uso de información privilegiada",
  "fraude a la Hacienda Pública",
  "estafa",
  "apropiación indebida",
] as const;

/** Most serious first. Used to pick the badge shown in the table. */
const STATUS_SEVERITY: readonly CaseStatus[] = ["condenado", "procesado", "investigado", "absuelto", "sobreseido"];

const SUMMARY_MAX = 300;

export const SentenceSchema = z.object({
  /** Date of the fallo. */
  date: z.iso.date(),
  prisonMonths: z.number().int().positive().optional(),
  disqualificationMonths: z.number().int().positive().optional(),
  fineEur: z.number().positive().optional(),
  /** Prison term suspended (e.g. for cooperation). */
  suspended: z.boolean().optional(),
  /** false = appeal or re-sentencing pending. */
  firm: z.boolean(),
});

export const CauseSchema = z
  .object({
    /** Canonical case name ("Caso Koldo"). Suspects sharing a name are related. */
    name: z.string().min(1),
    status: z.enum(STATUSES),
    /** Distinct crimes charged in this cause. */
    charges: z.array(z.enum(CRIMES)).min(1),
    /** Crimes convicted of. Subset of charges; only when condenado. */
    convictions: z.array(z.enum(CRIMES)).optional(),
    sentence: SentenceSchema.optional(),
    /** Total EUR for the whole case, not per suspect. Same-name causes must agree. */
    amount: z.number().nonnegative().optional(),
  })
  .superRefine((c, ctx) => {
    const issue = (message: string, path: string[] = []) => ctx.addIssue({ code: "custom", message, path });
    if (new Set(c.charges).size !== c.charges.length) issue("duplicate charges", ["charges"]);
    const convicted = c.status === "condenado";
    const hasConvictions = (c.convictions?.length ?? 0) > 0;
    if (convicted !== hasConvictions) issue("convictions present iff status is condenado", ["convictions"]);
    if (convicted !== Boolean(c.sentence)) issue("sentence present iff status is condenado", ["sentence"]);
    if (c.convictions?.some((k) => !c.charges.includes(k))) issue("convictions must be a subset of charges", ["convictions"]);
    if (c.sentence && !c.sentence.prisonMonths && !c.sentence.disqualificationMonths && !c.sentence.fineEur)
      issue("sentence needs prison, disqualification or fine", ["sentence"]);
  });

export const SuspectSchema = z
  .object({
    id: z.number().int().positive(),
    suspect: z.string().min(1),
    /** Role description shown under the name. */
    title: z.string().min(1),
    categories: z.array(z.enum(CATEGORIES)).min(1),
    party: z.enum(PARTIES).optional(),
    causes: z.array(CauseSchema).min(1),
    /** Year the suspect entered the case. Shown as "Año" and used by the year filter. */
    startYear: z.number().int().min(1970).max(2040),
    /** Date of the last content change. Never bump without a change. */
    lastUpdated: z.iso.date(),
    sourceUrls: z.array(z.url({ protocol: /^https$/ })).min(1),
    /** Court that issued the last ruling or is instructing. */
    court: z.string().optional(),
    summary: z.string().max(SUMMARY_MAX).optional(),
  })
  .superRefine((s, ctx) => {
    const issue = (message: string, path: string[] = []) => ctx.addIssue({ code: "custom", message, path });
    if (new Set(s.sourceUrls).size !== s.sourceUrls.length) issue("duplicate sourceUrls", ["sourceUrls"]);
    if (s.sourceUrls.every((u) => /wikipedia\.org/.test(u))) issue("needs a non-wikipedia source", ["sourceUrls"]);
    const names = s.causes.map((c) => normalize(c.name));
    if (new Set(names).size !== names.length) issue("duplicate cause names", ["causes"]);
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
export type Party = (typeof PARTIES)[number];
export type CaseStatus = (typeof STATUSES)[number];
export type Crime = (typeof CRIMES)[number];
export type Sentence = z.infer<typeof SentenceSchema>;
export type Cause = z.infer<typeof CauseSchema>;
export type Suspect = z.infer<typeof SuspectSchema>;

/** Suspect plus fields derived for the UI. */
export type SuspectView = Suspect & {
  status: CaseStatus;
  caseName: string;
  relatedIds: number[];
  /** Distinct crimes charged across causes. */
  crimes: Crime[];
  /** crimes.length */
  accusations: number;
  /** Distinct crimes convicted of across causes. */
  sentences: number;
  /** Sort key: max prison months, else max disqualification months, else 0. */
  penaltyMonths: number;
  /** Sentence of the condenado cause, if any. */
  sentence?: Sentence;
};

/** Lower-case, accent-stripped key for comparisons. */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function worstStatus(causes: Cause[]): CaseStatus {
  return STATUS_SEVERITY.find((st) => causes.some((c) => c.status === st)) ?? "sobreseido";
}

const unique = <T,>(xs: T[]): T[] => [...new Set(xs)];

export function deriveView(suspects: Suspect[]): SuspectView[] {
  const keys = (s: Suspect) => s.causes.map((c) => normalize(c.name));
  return suspects.map((s) => {
    const mine = new Set(keys(s));
    const crimes = unique(s.causes.flatMap((c) => c.charges));
    const sentences = s.causes.map((c) => c.sentence).filter((x): x is Sentence => Boolean(x));
    const max = (pick: (x: Sentence) => number | undefined) => Math.max(0, ...sentences.map((x) => pick(x) ?? 0));
    return {
      ...s,
      status: worstStatus(s.causes),
      caseName: s.causes.map((c) => c.name).join(" / "),
      relatedIds: suspects.filter((o) => o.id !== s.id && keys(o).some((k) => mine.has(k))).map((o) => o.id),
      crimes,
      accusations: crimes.length,
      sentences: unique(s.causes.flatMap((c) => c.convictions ?? [])).length,
      penaltyMonths: max((x) => x.prisonMonths) || max((x) => x.disqualificationMonths),
      sentence: sentences[0],
    };
  });
}

function formatMonths(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y}a`, m && `${m}m`].filter(Boolean).join(" ");
}

export function formatPenalty(s: Sentence): string {
  const parts = [
    s.prisonMonths && `${formatMonths(s.prisonMonths)} prisión${s.suspended ? " (suspendida)" : ""}`,
    s.disqualificationMonths && `${formatMonths(s.disqualificationMonths)} inhabilitación`,
    s.fineEur && `multa ${new Intl.NumberFormat("es-ES").format(s.fineEur)} €`,
  ].filter((p): p is string => Boolean(p));
  return parts.join(" · ") + (s.firm ? "" : " (no firme)");
}
