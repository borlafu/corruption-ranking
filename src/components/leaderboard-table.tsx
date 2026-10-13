"use client";

import { useState, useMemo, Fragment, type MouseEvent } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { badgeVariants } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { formatPenalty, type SuspectView } from "@/lib/schema";
import { slug } from "@/lib/filters";
import { categoryConfig, clemencySuffix, partyLabel, statusConfig } from "@/lib/status-ui";
import { CaseDetailRow } from "@/components/case-detail-row";
import { FilterLink } from "@/components/nav";
import { YearInfo } from "@/components/info-popover";
import { SourceList } from "@/components/source-list";

type SortKey = keyof Pick<SuspectView, "suspect" | "accusations" | "sentences" | "startYear" | "penaltyMonths">;
type SortDirection = "asc" | "desc";

const COLUMN_COUNT = 10;

const subtleLink =
  "rounded-sm hover:text-foreground hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function SortableHeader({
  label,
  sortKey,
  active,
  direction,
  onSort,
  className,
  info,
}: {
  label: string;
  sortKey: SortKey;
  active: boolean;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
  className?: string;
  /** Rendered beside the sort button, never inside it: no nested interactive elements. */
  info?: React.ReactNode;
}) {
  const Icon = !active ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead className={className} aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}>
      <span className="inline-flex items-center">
        <Button variant="ghost" onClick={() => onSort(sortKey)} className="px-2">
          {label}
          <Icon className={`h-4 w-4 ${active ? "" : "text-muted-foreground/60"}`} aria-hidden />
        </Button>
        {info}
      </span>
    </TableHead>
  );
}

function compareBy(key: SortKey, a: SuspectView, b: SuspectView): number {
  const x = a[key];
  const y = b[key];
  return typeof x === "string" ? x.localeCompare(y as string, "es") : x - (y as number);
}

type Props = {
  cases: SuspectView[];
  allCases: SuspectView[];
  openId: number | null;
  onToggle: (id: number) => void;
};

export function LeaderboardTable({ cases, allCases, openId, onToggle }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("sentences");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection(key === "suspect" ? "asc" : "desc");
    }
  };

  const sortedCases = useMemo(() => {
    const sign = sortDirection === "desc" ? -1 : 1;
    return [...cases].sort(
      (a, b) => sign * compareBy(sortKey, a, b) || a.suspect.localeCompare(b.suspect, "es")
    );
  }, [cases, sortKey, sortDirection]);

  // Row click is a mouse shortcut; links and buttons inside the row keep their own behavior.
  const onRowClick = (e: MouseEvent, id: number) => {
    if ((e.target as HTMLElement).closest("a, button, [role=dialog]")) return;
    onToggle(id);
  };

  const sortProps = { direction: sortDirection, onSort: handleSort };

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableCaption className="sr-only">
          Sospechosos en casos de corrupción. Cada fila tiene un botón para ver detalles.
        </TableCaption>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="w-[50px] text-center">#</TableHead>
            <SortableHeader label="Sospechoso" sortKey="suspect" active={sortKey === "suspect"} {...sortProps} />
            <TableHead className="hidden md:table-cell">Categoría</TableHead>
            <TableHead className="hidden sm:table-cell">Estado</TableHead>
            <SortableHeader
              label="Año"
              sortKey="startYear"
              active={sortKey === "startYear"}
              className="hidden sm:table-cell text-right"
              info={<YearInfo />}
              {...sortProps}
            />
            <SortableHeader
              label="Acusaciones"
              sortKey="accusations"
              active={sortKey === "accusations"}
              className="text-right"
              {...sortProps}
            />
            <SortableHeader
              label="Condenas"
              sortKey="sentences"
              active={sortKey === "sentences"}
              className="text-right"
              {...sortProps}
            />
            <SortableHeader
              label="Pena"
              sortKey="penaltyMonths"
              active={sortKey === "penaltyMonths"}
              className="hidden lg:table-cell"
              {...sortProps}
            />
            <TableHead className="text-center">Fuentes</TableHead>
            <TableHead className="w-[40px]">
              <span className="sr-only">Detalles</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCases.length > 0 ? (
            sortedCases.map((c, index) => {
              const status = statusConfig[c.status];
              const isExpanded = openId === c.id;
              return (
                <Fragment key={c.id}>
                  <TableRow
                    id={`s-${c.id}`}
                    className={`scroll-mt-4 cursor-pointer transition-colors hover:bg-muted/20 ${isExpanded ? "bg-muted/30" : ""}`}
                    onClick={(e) => onRowClick(e, c.id)}
                  >
                    <TableCell className="text-center text-muted-foreground font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      <div>{c.suspect}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {c.causes.map((k, i) => (
                          <Fragment key={k.name}>
                            {i > 0 && " / "}
                            <FilterLink patch={{ caso: slug(k.name) }} title={`Ver todos los implicados en ${k.name}`} className={subtleLink}>
                              {k.name}
                            </FilterLink>
                          </Fragment>
                        ))}
                      </div>
                      <FilterLink
                        patch={{ estado: [c.status] }}
                        title={`Filtrar por ${status.label}`}
                        className={`sm:hidden mt-1 ${badgeVariants({ variant: "outline" })} ${status.className} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                      >
                        {status.label}
                      </FilterLink>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {c.categories.map((cat) => {
                          const { icon: Icon, label } = categoryConfig[cat];
                          return (
                            <FilterLink
                              key={cat}
                              patch={{ cat: [cat] }}
                              title={`Filtrar por ${label}`}
                              className={`${badgeVariants({ variant: "outline" })} gap-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                            >
                              <Icon className="h-3.5 w-3.5 text-accent" aria-hidden />
                              <span className="sr-only lg:not-sr-only">{label}</span>
                            </FilterLink>
                          );
                        })}
                        {c.party && (
                          <FilterLink
                            patch={{ partido: [c.party] }}
                            title={`Filtrar por ${partyLabel[c.party]}`}
                            className={`${badgeVariants({ variant: "outline" })} hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                          >
                            {partyLabel[c.party]}
                          </FilterLink>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <FilterLink
                        patch={{ estado: [c.status] }}
                        title={`Filtrar por ${status.label}`}
                        className={`${badgeVariants({ variant: "outline" })} ${status.className} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                      >
                        {status.label}
                      </FilterLink>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right font-mono text-muted-foreground">
                      <FilterLink patch={{ anio: [c.startYear] }} title={`Filtrar por ${c.startYear}`} className={subtleLink}>
                        {c.startYear}
                      </FilterLink>
                    </TableCell>
                    <TableCell className="text-right font-mono text-lg font-bold">{c.accusations}</TableCell>
                    <TableCell className="text-right font-mono text-lg font-bold text-primary">{c.sentences}</TableCell>
                    <TableCell
                      className={`hidden lg:table-cell text-xs ${c.sentence?.prisonMonths ? "text-status-condenado" : "text-muted-foreground"}`}
                    >
                      {c.sentence ? formatPenalty(c.sentence) : "—"}
                      {c.clemency && ` · ${clemencySuffix(c.clemency)}`}
                    </TableCell>
                    <TableCell className="text-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-mono text-xs h-7 min-w-[2rem]"
                            aria-label={`Ver ${c.sourceUrls.length} fuentes de ${c.suspect}`}
                          >
                            {c.sourceUrls.length}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-3" align="end">
                          <p className="text-xs font-semibold mb-2 text-muted-foreground">Fuentes ({c.sourceUrls.length})</p>
                          <SourceList urls={c.sourceUrls} />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="w-[40px]">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        data-toggle
                        aria-expanded={isExpanded}
                        aria-controls={isExpanded ? `detail-${c.id}` : undefined}
                        aria-label={`${isExpanded ? "Cerrar" : "Ver"} detalles de ${c.suspect}`}
                        onClick={() => onToggle(c.id)}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={COLUMN_COUNT} className="p-0">
                        <CaseDetailRow caseData={c} allCases={allCases} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="h-24 text-center text-muted-foreground">
                No hay casos que coincidan con el filtro actual.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
