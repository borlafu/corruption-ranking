"use client";

import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, type Crime } from "@/lib/schema";
import { hasFilters, type Filters } from "@/lib/filters";
import { categoryConfig } from "@/lib/status-ui";

type Props = {
  filters: Filters;
  years: number[];
  crimes: Crime[];
  /** Display name for the active `caso` slug. */
  caseName?: string;
  onChange: (patch: Filters) => void;
  onSearch: (q: string) => void;
  onClear: () => void;
};

const chipClass = "transition-colors";

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2 items-center justify-center">
      <span className="text-sm font-medium mr-2 text-muted-foreground" aria-hidden>
        {label}:
      </span>
      {children}
    </div>
  );
}

function Chip({ pressed, onClick, children, className = "" }: { pressed: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <Button
      variant={pressed ? "secondary" : "outline"}
      size="sm"
      aria-pressed={pressed}
      onClick={onClick}
      className={`${chipClass} ${pressed ? "ring-1 ring-accent" : ""} ${className}`}
    >
      {children}
    </Button>
  );
}

export function FilterBar({ filters, years, crimes, caseName, onChange, onSearch, onClear }: Props) {
  const labels: Record<keyof Filters, string | undefined> = {
    cat: filters.cat && categoryConfig[filters.cat].label,
    anio: filters.anio?.toString(),
    delito: filters.delito,
    caso: filters.caso && (caseName ?? filters.caso),
    q: filters.q && `“${filters.q}”`,
  };
  const active = (Object.entries(labels) as [keyof Filters, string | undefined][]).filter(
    (e): e is [keyof Filters, string] => Boolean(e[1])
  );

  return (
    <div className="space-y-4 mb-4">
      <ChipGroup label="Categoría">
        <Chip pressed={!filters.cat} onClick={() => onChange({ cat: undefined })}>
          Todas
        </Chip>
        {CATEGORIES.map((cat) => {
          const { icon: Icon, label } = categoryConfig[cat];
          return (
            <Chip key={cat} pressed={filters.cat === cat} onClick={() => onChange({ cat })} className="gap-2">
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Chip>
          );
        })}
      </ChipGroup>

      <ChipGroup label="Año">
        <Chip pressed={!filters.anio} onClick={() => onChange({ anio: undefined })}>
          Todos
        </Chip>
        {years.map((year) => (
          <Chip key={year} pressed={filters.anio === year} onClick={() => onChange({ anio: year })} className="font-mono">
            {year}
          </Chip>
        ))}
      </ChipGroup>

      <div className="flex flex-wrap gap-2 items-center justify-center">
        <Select
          value={filters.delito ?? "all"}
          onValueChange={(v) => onChange({ delito: v === "all" ? undefined : (v as Crime) })}
        >
          <SelectTrigger className="w-[260px] h-9 bg-card/60" aria-label="Filtrar por delito">
            <SelectValue placeholder="Delito" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los delitos</SelectItem>
            {crimes.map((crime) => (
              <SelectItem key={crime} value={crime}>
                {crime}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative w-full max-w-xs">
          <label htmlFor="search" className="sr-only">
            Buscar sospechoso, caso, cargo o delito
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
          <Input
            id="search"
            type="search"
            placeholder="Buscar sospechoso o caso..."
            value={filters.q ?? ""}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 bg-card/60"
          />
        </div>
      </div>

      {hasFilters(filters) && (
        <div className="flex flex-wrap gap-2 items-center justify-center" aria-label="Filtros activos" role="group">
          {active.map(([key, label]) => (
            <Button
              key={key}
              variant="secondary"
              size="sm"
              className="h-7 gap-1 rounded-full"
              aria-label={`Quitar filtro ${label}`}
              onClick={() => onChange({ [key]: undefined })}
            >
              {label}
              <X className="h-3.5 w-3.5" aria-hidden />
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="h-7" onClick={onClear}>
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
