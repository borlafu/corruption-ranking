"use client";

import Link from "next/link";
import Script from "next/script";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { CONSENT_KEY, GA_ID } from "@/lib/analytics";

type Consent = "granted" | "denied" | null;

// Local on purpose: legal-page.tsx imports site.ts, which would pull data.json into this client bundle.
const footLinkClass =
  "hover:underline underline-offset-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/*
 * The visitor's choice, as an external store: read from localStorage once and cached so
 * useSyncExternalStore gets a stable snapshot; every write notifies the subscribers.
 * gtag.js is never loaded before "Aceptar" (Consent Mode's "basic" setup), so a visitor who
 * has not chosen, or rejected, sends nothing to Google — not even cookieless pings.
 */
let cached: Consent | undefined;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readConsent(): Consent {
  if (cached === undefined) {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      cached = stored === "granted" || stored === "denied" ? stored : null;
    } catch {
      cached = null; // Storage blocked: ask; the answer then lasts this page load.
    }
  }
  return cached;
}

/**
 * Static HTML can't know the choice: "denied" prerenders no tag and no banner, only the
 * preferences link. After hydration the real choice shows the banner if there is none.
 */
const serverConsent = (): Consent => "denied";

/** Withdrawing consent removes what it allowed: GA4's `_ga` and `_ga_<stream>` cookies. */
function clearGaCookies() {
  for (const cookie of document.cookie.split("; ")) {
    const name = cookie.split("=")[0];
    if (!name.startsWith("_ga")) continue;
    // gtag sets them on the widest domain the browser accepts, here the hostname itself.
    document.cookie = `${name}=; Max-Age=0; path=/; domain=${location.hostname}`;
    document.cookie = `${name}=; Max-Age=0; path=/`;
  }
}

function setConsent(next: Consent) {
  cached = next;
  try {
    if (next) localStorage.setItem(CONSENT_KEY, next);
    else localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Storage blocked: the choice still holds for this page load.
  }
  // gtag.js may already be running from an earlier "Aceptar" in this page load. Google's
  // documented opt-out flag stops it from sending anything further; clearing it resumes.
  (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = next !== "granted";
  if (next !== "granted") clearGaCookies();
  listeners.forEach((listener) => listener());
}

/**
 * Google Analytics behind a consent banner (LSSI art. 22.2 / GDPR): the tag loads only after
 * "Aceptar", rejecting is one click as prominent as accepting, and "Preferencias de cookies"
 * at the foot of every page reopens the choice, as easy to withdraw as it was to give.
 */
export function Analytics() {
  const consent = useSyncExternalStore(subscribe, readConsent, serverConsent);

  return (
    <>
      {consent === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}

      {consent === null && (
        <section aria-label="Cookies" className="fixed inset-x-0 bottom-0 z-50 border-t bg-card p-4 shadow-lg">
          <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm text-muted-foreground">
              ¿Nos dejas contar visitas? Con tu permiso, Google Analytics usa cookies para saber cuánta gente
              pasa por aquí. Las únicas cuentas que llevamos son de visitas, y ninguna en Suiza.{" "}
              <Link href="/cookies" className={`text-primary ${footLinkClass}`}>
                Más información
              </Link>
            </p>
            {/* Same variant on purpose: rejecting must be as easy and as visible as accepting. */}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setConsent("denied")}>
                Rechazar
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConsent("granted")}>
                Aceptar
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* The policy links stay up while the banner shows; the preferences button only once there is a choice to change. */}
      <p className="pb-6 text-center text-xs text-muted-foreground">
        {consent !== null && (
          <>
            <button type="button" onClick={() => setConsent(null)} className={footLinkClass}>
              Preferencias de cookies
            </button>
            {" · "}
          </>
        )}
        <Link href="/cookies" className={footLinkClass}>
          Política de cookies
        </Link>
        {" · "}
        <Link href="/privacidad" className={footLinkClass}>
          Privacidad
        </Link>
      </p>
    </>
  );
}
