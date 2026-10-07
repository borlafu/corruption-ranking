"use client";

import { ExternalLink, Scale, Euro, Gavel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPenalty, type SuspectView } from "@/lib/schema";
import { statusConfig } from "@/lib/status-ui";

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
            {amountFormatted && (
              <span className="flex items-center gap-1.5">
                <Euro className="h-3.5 w-3.5 shrink-0" />
                {amountFormatted}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {c.causes.map((cause) => (
              <div key={cause.name} className="rounded-md border border-border/40 p-2 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold">{cause.name}</span>
                  <Badge variant="outline" className={`text-[10px] ${statusConfig[cause.status].className}`}>
                    {statusConfig[cause.status].label}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {cause.charges.map((crime) => {
                    const convicted = cause.convictions?.includes(crime) ?? false;
                    return (
                      <Badge
                        key={crime}
                        variant="outline"
                        className={`text-[10px] ${convicted ? statusConfig.condenado.className : ""}`}
                      >
                        {crime}
                      </Badge>
                    );
                  })}
                </div>
                {cause.sentence && (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Gavel className="h-3.5 w-3.5 shrink-0" />
                    {formatPenalty(cause.sentence)} ·{" "}
                    {new Date(cause.sentence.date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
              </div>
            ))}
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
