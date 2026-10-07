"use client";

import { useState, useMemo, Fragment, type FC } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Landmark, Users, Flower2, ExternalLink, Briefcase, Handshake, ChevronDown, ChevronUp } from "lucide-react";
import type { SuspectView, Allegiance, CaseStatus } from "@/lib/schema";
import { CaseDetailRow } from "@/components/case-detail-row";

type SortKey = keyof Pick<SuspectView, "suspect" | "accusations" | "sentences">;

const allegianceIcons: Record<Allegiance, React.ElementType> = {
  gobierno: Briefcase,
  familia: Users,
  psoe: Flower2,
  institucional: Landmark,
  entorno: Handshake,
};

const allegianceLabels: Record<Allegiance, string> = {
  gobierno: "Gobierno",
  familia: "Familia",
  psoe: "PSOE",
  institucional: "Institucional",
  entorno: "Entorno",
};

const statusConfig: Record<CaseStatus, { label: string; className: string }> = {
  investigado: { label: "Investigado/a", className: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300" },
  procesado: { label: "Procesado/a", className: "border-orange-500/40 bg-orange-500/10 text-orange-300" },
  condenado: { label: "Condenado/a", className: "border-red-600/40 bg-red-600/15 text-red-300" },
  absuelto: { label: "Absuelto/a", className: "border-green-600/40 bg-green-600/10 text-green-300" },
  sobreseido: { label: "Sobreseído/a", className: "border-border bg-muted text-muted-foreground" },
};

const SortableHeader: FC<{
  label: string;
  sortKey: SortKey;
  activeSortKey: SortKey | null;
  sortDirection: "asc" | "desc";
  onClick: (key: SortKey) => void;
  className?: string;
}> = ({ label, sortKey, activeSortKey, sortDirection, onClick, className }) => (
  <TableHead className={className}>
    <Button variant="ghost" onClick={() => onClick(sortKey)} className="px-2">
      {label}
      <ArrowUpDown className={`ml-2 h-4 w-4 ${activeSortKey === sortKey ? "" : "text-muted-foreground/50"}`} />
    </Button>
  </TableHead>
);

export function LeaderboardTable({ cases, allCases }: { cases: SuspectView[]; allCases: SuspectView[] }) {
  const [sortKey, setSortKey] = useState<SortKey | null>("sentences");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const toggleRow = (id: number) =>
    setExpandedRowId((prev) => (prev === id ? null : id));

  const sortedCases = useMemo(() => {
    const copy = [...cases];
    if (!sortKey) {
      return copy.sort((a, b) => b.accusations - a.accusations);
    }
    return copy.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      let comparison = 0;
      if (valA > valB) comparison = 1;
      else if (valA < valB) comparison = -1;
      return sortDirection === "desc" ? comparison * -1 : comparison;
    });
  }, [cases, sortKey, sortDirection]);

  return (
    <TooltipProvider>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[50px] text-center">#</TableHead>
              <SortableHeader
                label="Sospechoso"
                sortKey="suspect"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onClick={handleSort}
              />
              <TableHead className="hidden md:table-cell">Categoría</TableHead>
              <TableHead className="hidden sm:table-cell">Estado</TableHead>
              <SortableHeader
                label="Acusaciones"
                sortKey="accusations"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onClick={handleSort}
                className="text-right"
              />
              <SortableHeader
                label="Condenas"
                sortKey="sentences"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onClick={handleSort}
                className="text-right"
              />
              <TableHead className="text-center">Fuentes</TableHead>
              <TableHead className="w-[40px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCases.length > 0 ? (
              sortedCases.map((c, index) => {
                const status = statusConfig[c.status];
                const isExpanded = expandedRowId === c.id;
                return (
                  <Fragment key={c.id}>
                    <TableRow
                      className="transition-colors hover:bg-muted/20 cursor-pointer"
                      onClick={() => toggleRow(c.id)}
                    >
                      <TableCell className="text-center text-muted-foreground font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        <div>{c.suspect}</div>
                        <div className="text-xs text-muted-foreground font-normal">{c.caseName}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {c.categories.map((cat) => {
                            const Icon = allegianceIcons[cat];
                            return (
                              <Tooltip key={cat}>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="gap-2 cursor-default capitalize">
                                    <Icon className="h-3.5 w-3.5 text-accent" />
                                    <span className="hidden lg:inline">{allegianceLabels[cat]}</span>
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{allegianceLabels[cat]}</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className={`text-xs ${status.className}`}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-lg font-bold">{c.accusations}</TableCell>
                      <TableCell className="text-right font-mono text-lg font-bold text-primary">{c.sentences}</TableCell>
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        {c.sourceUrls.length > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="font-mono text-xs h-7 min-w-[2rem]">
                                {c.sourceUrls.length}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-3" align="end">
                              <p className="text-xs font-semibold mb-2 text-muted-foreground">
                                {c.sourceUrls.length} fuente(s)
                              </p>
                              <ul className="space-y-1.5">
                                {c.sourceUrls.map((url, i) => {
                                  let hostname = url;
                                  try {
                                    hostname = new URL(url).hostname.replace(/^www\./, "");
                                  } catch {
                                    // keep original
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
                            </PopoverContent>
                          </Popover>
                        )}
                      </TableCell>
                      <TableCell className="w-[40px]" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? "Cerrar detalles" : "Ver detalles"}
                          onClick={() => toggleRow(c.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={8} className="p-0">
                          <CaseDetailRow caseData={c} allCases={allCases} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No hay casos que coincidan con el filtro actual.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
