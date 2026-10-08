"use client";

import { Suspense, lazy, useState } from "react";
import type { SuspectView } from "@/lib/schema";

// Code-split: recharts stays out of the first-load bundle until the panel is opened.
const Charts = lazy(() => import("@/components/insights-charts"));

type Props = { cases: SuspectView[] };

/**
 * Charts of the currently filtered set. Collapsed by default, and the charts are
 * only mounted while open: recharts measures its container, which is 0x0 inside a
 * closed <details>.
 */
export function InsightsPanel({ cases }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <details
      className="mb-4 rounded-lg border bg-card/40"
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer px-4 py-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        Ver análisis del filtro
      </summary>
      <div className="p-2">
        {open &&
          (cases.length > 0 ? (
            // min-h matches the chart grid, so arriving charts do not shift the page.
            <Suspense fallback={<div className="min-h-[300px] p-4 text-sm text-muted-foreground">Cargando gráficos…</div>}>
              <Charts cases={cases} />
            </Suspense>
          ) : (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No hay datos que analizar con el filtro actual.
            </p>
          ))}
      </div>
    </details>
  );
}
