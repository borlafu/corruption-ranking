"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** Click- and keyboard-driven, unlike a `title` attribute, so it also works on touch. */
function InfoPopover({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" aria-label={label}>
          <Info className="h-4 w-4" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 text-xs leading-relaxed text-muted-foreground" align="start">
        {children}
      </PopoverContent>
    </Popover>
  );
}

/** Shown wherever "Año" appears: the column, the filter and the chart all read `startYear`. */
export function YearInfo() {
  return (
    <InfoPopover label="¿Qué significa el año?">
      <p className="mb-2 font-semibold text-foreground">Año de entrada en la causa</p>
      <p>
        El año en que esa persona entró en el caso: cuando un juzgado la citó por primera vez como
        investigada, procesada o acusada. No es el año de los hechos, ni el de apertura del caso, ni
        el de la sentencia.
      </p>
      <p className="mt-2">
        Por eso una misma causa abarca varios años: en el Caso Koldo hay implicados que entraron en
        2023 y otros en 2026.
      </p>
    </InfoPopover>
  );
}
