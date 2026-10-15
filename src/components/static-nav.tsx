"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { NavContext, type Nav } from "@/components/nav";
import { applyPatch, toSearch, type Filters } from "@/lib/filters";

type Props = {
  /** id -> suspect page path, for the ids `SuspectLink` can reach from here. */
  paths: Record<number, string>;
  children: React.ReactNode;
};

/**
 * `NavContext` for pages that are not the leaderboard. `FilterLink`/`SuspectLink` keep their real
 * hrefs, and a plain click navigates instead of filtering a table this page does not render.
 */
export function StaticNav({ paths, children }: Props) {
  const router = useRouter();

  const nav = useMemo<Nav>(() => {
    const filterHref = (patch: Filters) => `/${toSearch(applyPatch({}, patch))}`;
    const suspectHref = (id: number) => paths[id] ?? "/";
    return {
      filters: {},
      filterHref,
      suspectHref,
      applyFilters: (patch) => router.push(filterHref(patch)),
      openSuspect: (id) => router.push(suspectHref(id)),
    };
  }, [router, paths]);

  return <NavContext.Provider value={nav}>{children}</NavContext.Provider>;
}
