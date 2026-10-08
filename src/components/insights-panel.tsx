"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SuspectView } from "@/lib/schema";
import { NO_PARTY, statusCounts, yearPartyRows, type PartyKey } from "@/lib/insights";
import { partyLabel, statusConfig } from "@/lib/status-ui";

type Props = { cases: SuspectView[] };

const CHART_HEIGHT = 260;

/** One --party-* token per series key, declared in globals.css. */
const partyFill = (key: PartyKey): string => `var(--party-${key})`;

const axis = { stroke: "var(--color-muted-foreground)", fontSize: 12 } as const;
const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  color: "var(--color-popover-foreground)",
  fontSize: 12,
};

const partyKeyLabel = (key: PartyKey): string => (key === NO_PARTY ? "Sin partido" : partyLabel[key]);

/** The same numbers as the chart, for screen readers and copy-paste. */
function DataTable({ caption, columns, rows }: { caption: string; columns: string[]; rows: (string | number)[][] }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c} scope="col">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row[0])}>
            <th scope="row">{row[0]}</th>
            {row.slice(1).map((cell, i) => (
              <td key={columns[i + 1]}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Chart({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-card/60 p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function Charts({ cases }: Props) {
  const statuses = useMemo(() => statusCounts(cases), [cases]);
  const { rows, keys } = useMemo(() => yearPartyRows(cases), [cases]);

  const statusRows = useMemo(
    () => statuses.map((s) => ({ ...s, label: statusConfig[s.status].label })),
    [statuses]
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Chart title="Sospechosos por estado">
        <DataTable
          caption="Sospechosos por estado"
          columns={["Estado", "Sospechosos"]}
          rows={statusRows.map((s) => [s.label, s.count])}
        />
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={statusRows} layout="vertical" accessibilityLayer margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} stroke="var(--color-border)" />
            <XAxis type="number" allowDecimals={false} {...axis} />
            <YAxis type="category" dataKey="label" width={110} {...axis} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} />
            <Bar dataKey="count" name="Sospechosos" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {/* The status tokens exist because status-ui.ts spells out the matching utility classes. */}
              {statusRows.map((s) => (
                <Cell key={s.status} fill={`var(--color-status-${s.status})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Chart>

      <Chart title="Sospechosos por año y partido">
        <DataTable
          caption="Sospechosos por año y partido"
          columns={["Año", ...keys.map(partyKeyLabel)]}
          rows={rows.map((r) => [r.year, ...keys.map((k) => r[k] ?? 0)])}
        />
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={rows} accessibilityLayer margin={{ left: 8, right: 16 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis dataKey="year" {...axis} />
            <YAxis allowDecimals={false} width={32} {...axis} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {keys.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                name={partyKeyLabel(key)}
                stackId="parties"
                fill={partyFill(key)}
                stroke="var(--color-card)"
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Chart>
    </div>
  );
}

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
            <Charts cases={cases} />
          ) : (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No hay datos que analizar con el filtro actual.
            </p>
          ))}
      </div>
    </details>
  );
}
