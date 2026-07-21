export const category = [
  "gobierno",
  "familia",
  "psoe",
  "institucional",
] as const;

export type Allegiance = (typeof category)[number];

export type CaseStatus = "investigado" | "procesado" | "condenado" | "sobreseido";

export type Case = {
  id: number;
  suspect: string;
  title: string;
  accusations: number;
  sentences: number;
  category: Allegiance;
  sourceUrls: string[];
  status: CaseStatus;
  lastUpdated: string;
  caseName?: string;
  summary?: string;
  court?: string;
  startYear?: number;
  amount?: number;
  relatedCaseIds?: number[];
};
