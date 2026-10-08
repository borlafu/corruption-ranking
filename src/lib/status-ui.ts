import { Briefcase, Handshake, Landmark, Users, Vote, type LucideIcon } from "lucide-react";
import type { Allegiance, CaseStatus, Party } from "@/lib/schema";

// Class names are spelled out in full so Tailwind can detect them.
export const statusConfig: Record<CaseStatus, { label: string; className: string }> = {
  investigado: { label: "Investigado/a", className: "border-status-investigado/40 bg-status-investigado/10 text-status-investigado" },
  procesado: { label: "Procesado/a", className: "border-status-procesado/40 bg-status-procesado/10 text-status-procesado" },
  condenado: { label: "Condenado/a", className: "border-status-condenado/40 bg-status-condenado/15 text-status-condenado" },
  absuelto: { label: "Absuelto/a", className: "border-status-absuelto/40 bg-status-absuelto/10 text-status-absuelto" },
  sobreseido: { label: "Sobreseído/a", className: "border-border bg-muted text-status-sobreseido" },
};

export const categoryConfig: Record<Allegiance, { label: string; icon: LucideIcon }> = {
  gobierno: { label: "Gobierno", icon: Briefcase },
  familia: { label: "Familia", icon: Users },
  partido: { label: "Partido", icon: Vote },
  institucional: { label: "Institucional", icon: Landmark },
  entorno: { label: "Entorno", icon: Handshake },
};

// Text only in the table: no party logos, and no colour on a badge or a label.
// Charts need to tell series apart, so they use the --party-* tokens in globals.css:
// hues that evoke the party, desaturated to the site's register, never its brand colour.
export const partyLabel: Record<Party, string> = {
  psoe: "PSOE",
  pp: "PP",
  vox: "Vox",
  podemos: "Podemos",
  sumar: "Sumar",
  iu: "IU",
  junts: "Junts",
  erc: "ERC",
  pnv: "PNV",
  cs: "Cs",
};

const UTC_DATE: Intl.DateTimeFormatOptions = { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" };

/** Formats an ISO date (YYYY-MM-DD) without shifting it to the visitor's time zone. */
export function formatDate(iso: string, options: Intl.DateTimeFormatOptions = UTC_DATE): string {
  return new Date(iso).toLocaleDateString("es-ES", { ...options, timeZone: "UTC" });
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}
