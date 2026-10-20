"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { PARTIES, STATUSES, type SuspectView } from "@/lib/schema";
import { applyPatch, filterCases, findCause, parseFilters, toSearch, type Filters } from "@/lib/filters";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { FilterBar } from "@/components/filter-bar";
import { CaseBanner } from "@/components/case-banner";
import { InsightsPanel } from "@/components/insights-panel";
import { NavContext, type Nav } from "@/components/nav";
import { suspectPath } from "@/lib/suspects";

type Props = {
  cases: SuspectView[];
  /** Pre-formatted at build time. */
  lastUpdated: string;
  /** Pre-formatted date of the newest changelog entry. */
  lastReviewed: string;
};

type HistoryMode = "push" | "replace";

const HASH_PREFIX = "#s-";

const urlFor = (f: Filters, openId: number | null) =>
  `${toSearch(f) || "?"}${openId ? `${HASH_PREFIX}${openId}` : ""}`;

export function CaseLeaderboardPage({ cases, lastUpdated, lastReviewed }: Props) {
  const [filters, setFilters] = useState<Filters>({});
  const [openId, setOpenId] = useState<number | null>(null);
  // Suspect to scroll to and focus once its row has rendered.
  const pendingFocus = useRef<number | null>(null);

  // The static HTML renders unfiltered; the URL is applied once mounted and on back/forward.
  useEffect(() => {
    const sync = () => {
      setFilters(parseFilters(window.location.search));
      const { hash } = window.location;
      const id = hash.startsWith(HASH_PREFIX) ? Number(hash.slice(HASH_PREFIX.length)) || null : null;
      setOpenId(id);
      pendingFocus.current = id;
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);


  const commit = useCallback((f: Filters, id: number | null, mode: HistoryMode) => {
    setFilters(f);
    setOpenId(id);
    const url = urlFor(f, id);
    if (mode === "push") window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }, []);

  const parties = useMemo(() => PARTIES.filter((p) => cases.some((c) => c.party === p)), [cases]);
  const statuses = useMemo(() => STATUSES.filter((st) => cases.some((c) => c.status === st)), [cases]);
  const years = useMemo(() => [...new Set(cases.map((c) => c.startYear))].sort((a, b) => b - a), [cases]);
  const crimes = useMemo(
    () => [...new Set(cases.flatMap((c) => c.crimes))].sort((a, b) => a.localeCompare(b, "es")),
    [cases]
  );
  const pathById = useMemo(() => new Map(cases.map((c) => [c.id, suspectPath(c.suspect)])), [cases]);
  const filteredCases = useMemo(() => filterCases(cases, filters), [cases, filters]);
  const cause = useMemo(() => (filters.caso ? findCause(cases, filters.caso) : undefined), [cases, filters.caso]);

  useEffect(() => {
    const id = pendingFocus.current;
    if (id === null) return;
    pendingFocus.current = null;
    const row = document.getElementById(`s-${id}`);
    row?.scrollIntoView({ block: "center" });
    row?.querySelector<HTMLButtonElement>("[data-toggle]")?.focus({ preventScroll: true });
  }, [openId, filteredCases]);

  const nav: Nav = useMemo(
    () => ({
      filters,
      filterHref: (patch) => urlFor(applyPatch(filters, patch), null),
      // The suspect's own page, so the 154 records are crawlable from this HTML; a plain click is
      // still intercepted below and expands the row in place.
      suspectHref: (id) => pathById.get(id) ?? urlFor({}, id),
      applyFilters: (patch) => commit(applyPatch(filters, patch), null, "push"),
      openSuspect: (id) => {
        // Clear filters only if they hide the target suspect.
        const visible = filteredCases.some((c) => c.id === id);
        pendingFocus.current = id;
        commit(visible ? filters : {}, id, "push");
      },
    }),
    [filters, filteredCases, commit, pathById]
  );

  return (
    <NavContext.Provider value={nav}>
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-8 text-center">
          <h1 className="font-headline text-6xl lg:text-8xl font-bold uppercase tracking-wider">
            <a href="?" onClick={(e) => { e.preventDefault(); commit({}, null, "push"); }} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
              España <span className="text-primary">Corrupta</span>
            </a>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Seguimiento independiente de las causas judiciales por corrupción en España: quién está investigado, procesado o condenado, en qué caso y con qué pena.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {lastUpdated && <>Última actualización: {lastUpdated} · </>}
            <a href="/cambios" className="underline underline-offset-2 hover:text-foreground rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Registro de cambios
            </a>
            {lastReviewed && <> (revisado el {lastReviewed})</>}
          </p>
        </header>

        <FilterBar
          filters={filters}
          years={years}
          parties={parties}
          statuses={statuses}
          crimes={crimes}
          caseName={cause?.name}
          onChange={nav.applyFilters}
          onSearch={(q) => commit(applyPatch(filters, { q }), null, "replace")}
          onClear={() => commit({}, null, "push")}
        />

        {cause && <CaseBanner cause={cause} />}

        <p role="status" className="mb-2 text-center text-sm text-muted-foreground">
          {filteredCases.length} de {cases.length} sospechosos
        </p>

        <InsightsPanel cases={filteredCases} />

        <div className="rounded-lg border shadow-lg overflow-hidden bg-card/80">
          <LeaderboardTable
            cases={filteredCases}
            allCases={cases}
            openId={openId}
            onToggle={(id) => commit(filters, openId === id ? null : id, "replace")}
          />
        </div>

        <footer className="text-center mt-12 text-muted-foreground text-sm">
          <p>Los datos se basan en informaciones publicadas por medios de comunicación e instituciones judiciales.</p>
        </footer>
      </main>
    </NavContext.Provider>
  );
}
