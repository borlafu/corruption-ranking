# corruption-ranking

## Commands

- **Dev**: `npm run dev` → Next.js + Turbopack on port 9002
- **Build**: `npm run build` (static export via `output: 'export'`)
- **Lint**: `npm run lint` (ESLint flat config, `eslint-config-next` incl. jsx-a11y)
- **Test**: `npm test` (`node:test` via tsx, `src/lib/*.test.ts`)
- **Typecheck**: `npm run typecheck` (`tsc --noEmit`)
- **Validate data**: `npm run validate-data` (Zod schema + dataset rules on `src/lib/data.json`; runs in CI before build)

## Stack

Next.js 16, React 19, TypeScript 7 (`tsc`) with the TS 6 API aliased as `typescript` for typescript-eslint and Next's build type check, Tailwind CSS v4, Radix UI / shadcn, Zod.

## Data

- `src/lib/schema.ts` is the single source of truth (Zod schema, derived TS types, UI view derivation). No separate types file.
- One record = one suspect; `causes[]` holds each court case with its own `status`. Related suspects are those sharing a cause name. `categories` are roles; `party` (optional, `PARTIES` enum) is separate.
- Each cause carries `charges[]`/`convictions[]` from the `CRIMES` enum and, when condenado, a `sentence` (date, prison/disqualification months, fine, `firm`). Counts shown in the UI are derived in `deriveView`, never stored. Each indulto or applied amnistía is appended to the `causes[].clemency` array (oldest first) and never changes `status` or removes a record. `amount` is per case, on the cause.
- Never bump `lastUpdated` without a content change. Never cite Wikipedia alone. Only court-opened causes (imputado/procesado/condenado/absuelto/sobreseido) qualify; complaints alone do not. Scope: all parties, national + regional (no municipal), causes open or resolved since 2018-01-01.
- Updates: `/update-data` skill (`.claude/skills/update-data/SKILL.md`), run weekly by a local Claude Code scheduled task; it opens a PR, merge deploys. Research is per cause, not per suspect (43 causes hold the records); settled causes are swept monthly. Every run, changes or not, prepends a Spanish entry to `src/lib/changelog.json` (shown at `/cambios`); `validate-data` checks its ids against `data.json` and that its newest date is not older than the newest `lastUpdated`.

## Notes

- Static export — no server-side runtime. API routes not supported. `page.tsx` parses data at build time.
- One page per suspect at `/sospechoso/<slug>` (`src/app/sospechoso/[slug]/page.tsx`, 154 prerendered via `generateStaticParams`), where the record's causes, charges, sentences, sources and history are actually indexable — the leaderboard mounts that detail only on click, which a crawler never performs. Slugs come from `src/lib/suspects.ts` (`suspectSlug` = `filters.ts`'s `slug` of the name); `validate-data` fails the build on two names that collapse to the same slug, which `DataSchema`'s normalized-name check cannot see. The page reuses `CaseDetailRow` inside `StaticNav` (`src/components/static-nav.tsx`), the `NavContext` whose `FilterLink`/`SuspectLink` really navigate instead of filtering a table that is not there.
- The suspect name in each table row and every changelog reference link to that page, so all 154 are reachable from the root's and `/cambios`' static HTML; a plain click on the name is still intercepted and expands the row in place.
- SEO surfaces: `src/lib/site.ts` holds the canonical origin, the one shared description and the newest `lastUpdated`; `layout.tsx` (canonical + Open Graph), `page.tsx` (`Dataset` JSON-LD), `robots.ts` and `sitemap.ts` all read from it. `/cambios` (`src/app/cambios/page.tsx`) sets its own canonical and advertises `/cambios/feed.xml` (RSS route handler, `force-static`); suspects' "Historial de cambios" comes from `deriveView(data, changelog)`. `src/lib/changelog.ts` parses the JSON and is server-only by use — client components take `KIND_LABEL`/`entryId` from `status-ui.ts`. In `firebase.json`, `cleanUrls` serves `cambios.html` at `/cambios`, `trailingSlash: false` redirects `/cambios/`, and a `headers` entry gives `**/feed.xml` its `application/rss+xml` type, which a static export otherwise loses (the route handler's own `Content-Type` is build-time only). Hosting config is testable with `firebase emulators:start --only hosting`. Metadata routes need `export const dynamic = "force-static"` under `output: 'export'`. `src/app/opengraph-image.tsx` renders the one share card (counts from `deriveView`); the root gets it by file convention, but `/cambios` and suspect pages set their own `openGraph`, which replaces the layout's, so they pass `OG_IMAGE` from `site.ts` explicitly. It exports with no extension, so `firebase.json` also sets its `image/png` type. The description's "desde" year is `FIRST_YEAR`, the oldest `startYear` in the data — not the 2018 scope date. `firebase.json` has no catch-all rewrite on purpose: filters are query strings, so a `** → /index.html` rewrite would only turn unknown paths into 200s and shadow `404.html`.
- Type errors fail the build. `validate-data` is the data regression check; `npm test` covers URL filter logic.

## Frontend

- Design tokens live in `src/app/globals.css` `@theme` (single dark theme; text colors AA on `--color-card`). Status/category labels, icons and classes: `src/lib/status-ui.ts`. Values read from JS instead of a utility class (`--party-*`) sit in a plain `:root` block — Tailwind drops `@theme` variables no class uses.
- Filters and the open suspect live in the URL (`?cat&partido&estado&anio&delito&caso&q#s-<id>`), parsed by `src/lib/filters.ts`. `cat`/`partido`/`estado`/`anio`/`delito` are comma-separated multi-value facets (OR within, AND across); `caso` and `q` are single. Patches go through `applyPatch`, where an array **toggles** membership and `undefined` clears the field.
- `estado` matches the suspect's derived worst status (`SuspectView.status`), so the filter, the Estado badge and the status chart always agree. Per-cause status badges (`case-detail-row.tsx`, `case-banner.tsx`) are deliberately not filter links — they would contradict it.
- "Año" is `startYear`: the year that suspect entered that cause, not the year of the facts or of the case. `YearInfo` in `src/components/info-popover.tsx` holds that copy once for the filter, the column header and the chart.
- Entity links use `FilterLink`/`SuspectLink` from `src/components/nav.tsx`; add new cross-links through them rather than local state.
- Google Analytics (`src/components/analytics.tsx`, mounted in `layout.tsx`) loads gtag.js only after the visitor clicks "Aceptar" in its banner (LSSI/GDPR); the choice sits in `localStorage`, and "Preferencias de cookies" at the foot of every page reopens it. Rejecting or withdrawing sets Google's `ga-disable-<id>` flag and deletes the `_ga` cookies. Any new tracker goes behind the same consent.
- `/cookies` and `/privacidad` (shell in `src/components/legal-page.tsx`) are the cookie policy and the GDPR art. 13 notice the banner and every page's foot link to. A new cookie, tracker, storage key or processor means updating them and their `updated` date; GA's retention period stated there must match GA Admin. Controller name and privacy email live in `src/lib/site.ts`, GA ids in `src/lib/analytics.ts`. `analytics.tsx` is a client component, so it must not import `legal-page.tsx` or `site.ts`: both pull `data.json` into the client bundle.
- `src/components/insights-panel.tsx` charts the filtered set; the counts come from `src/lib/insights.ts`. The charts live in `insights-charts.tsx`, `lazy()`-imported and mounted only while the `<details>` is open — recharts is ~370 KB that must stay out of the first-load bundle, and it measures a container that is 0x0 while closed. Keep recharts imports in that one module. Chart series use the `--party-*` tokens: a hue that evokes each party, desaturated to the site's register, never its brand colour. Badges and labels stay text-only.
