"use client";

import { useEffect } from "react";

// Native <details> does not reliably open on hash navigation: open the targeted update and scroll to it.
export function ChangelogHashOpen() {
  useEffect(() => {
    const openTarget = () => {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!(el instanceof HTMLDetailsElement)) return;
      el.open = true;
      el.scrollIntoView();
    };
    openTarget();
    window.addEventListener("hashchange", openTarget);
    return () => window.removeEventListener("hashchange", openTarget);
  }, []);
  return null;
}
