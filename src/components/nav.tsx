"use client";

import { createContext, useContext, type MouseEvent, type ReactNode } from "react";
import type { Filters } from "@/lib/filters";

/** In-page navigation: filter changes and opening a suspect, both reflected in the URL. */
export type Nav = {
  filters: Filters;
  filterHref: (patch: Filters) => string;
  suspectHref: (id: number) => string;
  applyFilters: (patch: Filters) => void;
  openSuspect: (id: number) => void;
};

export const NavContext = createContext<Nav | null>(null);

export function useNav(): Nav {
  const nav = useContext(NavContext);
  if (!nav) throw new Error("useNav must be used inside NavContext");
  return nav;
}

// Modified clicks (new tab, etc.) keep the browser default and follow the real href.
const isPlainClick = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

const linkClass =
  "rounded-sm hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type LinkProps = { className?: string; title?: string; children: ReactNode };

export function FilterLink({ patch, className = linkClass, title, children }: LinkProps & { patch: Filters }) {
  const nav = useNav();
  return (
    <a
      href={nav.filterHref(patch)}
      title={title}
      className={className}
      onClick={(e) => {
        if (!isPlainClick(e)) return;
        e.preventDefault();
        nav.applyFilters(patch);
      }}
    >
      {children}
    </a>
  );
}

export function SuspectLink({ id, className = linkClass, title, children }: LinkProps & { id: number }) {
  const nav = useNav();
  return (
    <a
      href={nav.suspectHref(id)}
      title={title}
      className={className}
      onClick={(e) => {
        if (!isPlainClick(e)) return;
        e.preventDefault();
        nav.openSuspect(id);
      }}
    >
      {children}
    </a>
  );
}
