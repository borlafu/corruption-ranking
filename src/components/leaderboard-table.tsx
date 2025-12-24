"use client";

import { useState, useMemo, type FC } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Landmark, Users, Flower2, ExternalLink, Briefcase } from "lucide-react";
import type { Case, Allegiance } from "@/lib/types";

type SortKey = keyof Pick<Case, "suspect" | "accusations" | "sentences">;

const allegianceIcons: Record<Allegiance, React.ElementType> = {
  gobierno: Briefcase,
  familia: Users,
  psoe: Flower2,
  institucional: Landmark,
};

const allegianceLabels: Record<Allegiance, string> = {
  gobierno: "Gobierno",
  familia: "Familia",
  psoe: "PSOE",
  institucional: "Institucional",
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

export function LeaderboardTable({ cases }: { cases: Case[] }) {
  const [sortKey, setSortKey] = useState<SortKey | null>("sentences");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const sortedCases = useMemo(() => {
    cases.sort((a, b) => {
      return b.accusations - a.accusations;
    });
    if (!sortKey) return cases;
    return cases.sort((a, b) => {
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
              <SortableHeader
                label="Acusaciones"
                sortKey="accusations"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onClick={handleSort}
                className="text-right"
              />
              <SortableHeader
                label="Sentencias"
                sortKey="sentences"
                activeSortKey={sortKey}
                sortDirection={sortDirection}
                onClick={handleSort}
                className="text-right"
              />
              <TableHead className="text-center">Fuentes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCases.length > 0 ? (
              sortedCases.map((c, index) => {
                const Icon = allegianceIcons[c.category];
                const label = allegianceLabels[c.category];
                return (
                  <TableRow key={c.id} className="transition-colors hover:bg-muted/20">
                    <TableCell className="text-center text-muted-foreground font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {c.suspect} <span className="text-muted-foreground sm:text-ellipsis">({c.title})</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="gap-2 cursor-default capitalize">
                            <Icon className="h-3.5 w-3.5 text-accent" />
                            <span className="hidden lg:inline">{label}</span>
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-right font-mono text-lg font-bold">{c.accusations}</TableCell>
                    <TableCell className="text-right font-mono text-lg font-bold text-primary">{c.sentences}</TableCell>
                    <TableCell className="text-center">
                      {c.sourceUrls.length > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" asChild>
                              <a href={c.sourceUrls[0]} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                                <span className="sr-only">Ver Fuente</span>
                              </a>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ver {c.sourceUrls.length} fuente(s)</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
