export const politicalAllegianceCategories = [
  "miembro del gobierno",
  "miembro de la familia",
  "servidor publico",
  "institución",
] as const;

export type PoliticalAllegiance = (typeof politicalAllegianceCategories)[number];

export type Case = {
  id: string;
  mainSuspect: string;
  accusations: number;
  sentences: number;
  politicalAllegianceCategory: PoliticalAllegiance;
  sourceUrls: string[];
};
