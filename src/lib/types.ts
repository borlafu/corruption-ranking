export const category = [
  "gobierno",
  "familia",
  "psoe",
  "institucional",
] as const;

export type Allegiance = (typeof category)[number];

export type Case = {
  id: string;
  mainSuspect: string;
  accusations: number;
  sentences: number;
  category: Allegiance;
  sourceUrls: string[];
};
