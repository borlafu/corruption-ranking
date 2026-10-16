/** GA4 web stream. Public by design: it ships in every page's HTML. */
export const GA_ID = "G-JCP1XHVJH4";

/** GA4's per-stream cookie, `_ga_<measurement id without "G-">`, as the cookie policy names it. */
export const GA_STREAM_COOKIE = `_ga_${GA_ID.replace(/^G-/, "")}`;

/** localStorage key holding the visitor's analytics choice. */
export const CONSENT_KEY = "analytics-consent";
