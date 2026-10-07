import type { CaseStatus } from "@/lib/schema";

export const statusConfig: Record<CaseStatus, { label: string; className: string }> = {
  investigado: { label: "Investigado/a", className: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300" },
  procesado: { label: "Procesado/a", className: "border-orange-500/40 bg-orange-500/10 text-orange-300" },
  condenado: { label: "Condenado/a", className: "border-red-600/40 bg-red-600/15 text-red-300" },
  absuelto: { label: "Absuelto/a", className: "border-green-600/40 bg-green-600/10 text-green-300" },
  sobreseido: { label: "Sobreseído/a", className: "border-border bg-muted text-muted-foreground" },
};
