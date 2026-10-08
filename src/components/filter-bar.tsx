"use client";

import { X, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CATEGORIES, type Crime, type Party } from "@/lib/schema";
import { hasFilters, type Filters } from "@/lib/filters";
import { categoryConfig, partyLabel } from "@/lib/status-ui";

type Props = {
  filters: Filters;
  years: number[];
  parties: Party[];
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

/** One removable pill per selected value. Patches with an array toggle that single value off. */
type Pill = { id: string; label: string; patch: Filters };

export function FilterBar({ filters, years, parties, crimes, caseName, onChange, onSearch, onClear }: Props) {
  const pills: Pill[] = [
    ...(filters.cat ?? []).map((cat) => ({ id: `cat-${cat}`, label: categoryConfig[cat].label, patch: { cat: [cat] } })),
    ...(filters.partido ?? []).map((p) => ({ id: `partido-${p}`, label: partyLabel[p], patch: { partido: [p] } })),
    ...(filters.anio ?? []).map((year) => ({ id: `anio-${year}`, label: String(year), patch: { anio: [year] } })),
    ...(filters.delito ?? []).map((crime) => ({ id: `delito-${crime}`, label: crime, patch: { delito: [crime] } })),
    ...(filters.caso ? [{ id: "caso", label: caseName ?? filters.caso, patch: { caso: undefined } }] : []),
    ...(filters.q ? [{ id: "q", label: `“${filters.q}”`, patch: { q: undefined } }] : []),
  ];

  const selectedCrimes = filters.delito ?? [];

  return (
    <div className="space-y-4 mb-4">
      <ChipGroup label="Categoría">
        <Chip pressed={!filters.cat?.length} onClick={() => onChange({ cat: undefined })}>
          Todas
        </Chip>
        {CATEGORIES.map((cat) => {
          const { icon: Icon, label } = categoryConfig[cat];
          return (
            <Chip
              key={cat}
              pressed={filters.cat?.includes(cat) ?? false}
              onClick={() => onChange({ cat: [cat] })}
              className="gap-2"
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Chip>
          );
        })}
      </ChipGroup>

      <ChipGroup label="Partido">
        <Chip pressed={!filters.partido?.length} onClick={() => onChange({ partido: undefined })}>
          Todos
        </Chip>
        {parties.map((partido) => (
          <Chip
            key={partido}
            pressed={filters.partido?.includes(partido) ?? false}
            onClick={() => onChange({ partido: [partido] })}
          >
            {partyLabel[partido]}
          </Chip>
        ))}
      </ChipGroup>

      <ChipGroup label="Año">
        <Chip pressed={!filters.anio?.length} onClick={() => onChange({ anio: undefined })}>
          Todos
        </Chip>
        {years.map((year) => (
          <Chip
            key={year}
            pressed={filters.anio?.includes(year) ?? false}
            onClick={() => onChange({ anio: [year] })}
            className="font-mono"
          >
            {year}
          </Chip>
        ))}
      </ChipGroup>

      <div className="flex flex-wrap gap-2 items-center justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 w-[260px] justify-between bg-card/60">
              {selectedCrimes.length === 0
                ? "Todos los delitos"
                : selectedCrimes.length === 1
                  ? selectedCrimes[0]
                  : `${selectedCrimes.length} delitos`}
              <ChevronDown className="h-4 w-4 opacity-60" aria-hidden />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-2" align="start">
            <div role="group" aria-label="Filtrar por delito" className="max-h-72 space-y-1 overflow-y-auto">
              {crimes.map((crime) => (
                <Chip
                  key={crime}
                  pressed={selectedCrimes.includes(crime)}
                  onClick={() => onChange({ delito: [crime] })}
                  className="w-full justify-start"
                >
                  {crime}
                </Chip>
              ))}
            </div>
            {selectedCrimes.length > 0 && (
              <Button variant="ghost" size="sm" className="mt-1 h-7 w-full" onClick={() => onChange({ delito: undefined })}>
                Quitar delitos
              </Button>
            )}
          </PopoverContent>
        </Popover>

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
          {pills.map(({ id, label, patch }) => (
            <Button
              key={id}
              variant="secondary"
              size="sm"
              className="h-7 gap-1 rounded-full"
              aria-label={`Quitar filtro ${label}`}
              onClick={() => onChange(patch)}
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
