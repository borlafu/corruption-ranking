import { Scale, Euro, Gavel } from "lucide-react";
import { badgeVariants } from "@/components/ui/badge";
import { FilterLink, SuspectLink } from "@/components/nav";
import { SourceList } from "@/components/source-list";
import { formatPenalty, type SuspectView } from "@/lib/schema";
import { slug } from "@/lib/filters";
import { KIND_LABEL, clemencyClassName, clemencyLabel, entryId, formatDate, formatEur, statusConfig } from "@/lib/status-ui";

type Props = {
  caseData: SuspectView;
  allCases: SuspectView[];
};

const chip = `${badgeVariants({ variant: "outline" })} gap-1 font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`;

export function CaseDetailRow({ caseData: c, allCases }: Props) {
  const relatedCases = allCases.filter((a) => c.relatedIds.includes(a.id));

  return (
    <div id={`detail-${c.id}`} className="p-4 border-t border-border/40 bg-muted/10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{c.summary ?? "Sin resumen disponible."}</p>

          {c.court && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Scale className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {c.court}
            </p>
          )}

          <ul className="space-y-2">
            {c.causes.map((cause) => (
              <li key={cause.name} className="rounded-md border border-border/60 p-2 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <FilterLink
                    patch={{ caso: slug(cause.name) }}
                    title={`Ver todos los implicados en ${cause.name}`}
                    className="font-semibold rounded-sm hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {cause.name}
                  </FilterLink>
                  <span className={`${badgeVariants({ variant: "outline" })} ${statusConfig[cause.status].className}`}>
                    {statusConfig[cause.status].label}
                  </span>
                  {cause.clemency && (
                    <span className={`${badgeVariants({ variant: "outline" })} ${clemencyClassName}`}>
                      {clemencyLabel(cause.clemency)} · <time dateTime={cause.clemency.date}>{formatDate(cause.clemency.date)}</time>
                    </span>
                  )}
                  {cause.amount !== undefined && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Euro className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {formatEur(cause.amount)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {cause.charges.map((crime) => {
                    const convicted = cause.convictions?.includes(crime) ?? false;
                    return (
                      <FilterLink
                        key={crime}
                        patch={{ delito: [crime] }}
                        title={`Filtrar por ${crime}`}
                        className={`${chip} ${convicted ? statusConfig.condenado.className : ""}`}
                      >
                        {convicted && <Gavel className="h-3 w-3" aria-hidden />}
                        {crime}
                        {convicted && <span className="sr-only"> (condenado)</span>}
                      </FilterLink>
                    );
                  })}
                </div>
                {cause.sentence && (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Gavel className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {formatPenalty(cause.sentence)} · {formatDate(cause.sentence.date)}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {relatedCases.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Implicados en las mismas causas</p>
              <ul className="flex flex-wrap gap-1.5">
                {relatedCases.map((rel) => (
                  <li key={rel.id}>
                    <SuspectLink id={rel.id} title={`Ir a ${rel.suspect}`} className={chip}>
                      {rel.suspect}
                    </SuspectLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5">Fuentes ({c.sourceUrls.length})</p>
          <SourceList urls={c.sourceUrls} />
          {c.history.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground mt-3 mb-1.5">Historial de cambios</p>
              <ul className="space-y-1 text-xs">
                {c.history.map((h) => (
                  <li key={h.date}>
                    <a
                      href={`/cambios#${entryId(h.date)}`}
                      className="text-primary hover:underline underline-offset-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <time dateTime={h.date}>{formatDate(h.date)}</time>
                    </a>{" "}
                    · {KIND_LABEL[h.kind]}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
