"use client";

import { ExternalLink, Scale, Calendar, Euro } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SuspectView } from "@/lib/schema";

type Props = {
  caseData: SuspectView;
  allCases: SuspectView[];
};

export function CaseDetailRow({ caseData: c, allCases }: Props) {
  const relatedCases = c.relatedIds
    .map((rid) => allCases.find((a) => a.id === rid))
    .filter((a): a is SuspectView => a !== undefined);

  const amount = c.causes.find((cause) => cause.amount)?.amount;
  const amountFormatted = amount
    ? new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(amount)
    : null;

  return (
    <div className="p-4 border-t border-border/40 bg-muted/5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {c.summary ?? "Sin resumen disponible."}
          </p>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {c.court && (
              <span className="flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 shrink-0" />
                {c.court}
              </span>
            )}
            {c.startYear && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                Caso abierto en {c.startYear}
              </span>
            )}
            {amountFormatted && (
              <span className="flex items-center gap-1.5">
                <Euro className="h-3.5 w-3.5 shrink-0" />
                {amountFormatted}
              </span>
            )}
          </div>

          {relatedCases.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Casos relacionados</p>
              <div className="flex flex-wrap gap-1.5">
                {relatedCases.map((rel) => (
                  <Badge key={rel.id} variant="outline" className="text-xs cursor-default">
                    {rel.suspect}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">
            Fuentes ({c.sourceUrls.length})
          </p>
          <ul className="space-y-1.5">
            {c.sourceUrls.map((url, i) => {
              let hostname = url;
              try {
                hostname = new URL(url).hostname.replace(/^www\./, "");
              } catch {
                // keep original if URL parsing fails
              }
              return (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs flex items-center gap-1.5 text-primary hover:underline break-all"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    {hostname}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
