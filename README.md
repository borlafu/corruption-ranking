# España Corrupta

Unofficial static leaderboard of Spanish corruption court cases: suspects, charges, procedural status and sentences, across all parties, national and regional level, for causes open or resolved since 2018-01-01. The site is in Spanish.

Live site: <https://corruption-ranking.web.app>

## Editorial criteria

- Only causes opened by a court qualify (`investigado`, `procesado`, `condenado`, `absuelto`, `sobreseido`). Complaints (querellas, denuncias) alone do not.
- A status is a judicial stage, not a finding of guilt. `investigado` never means convicted.
- Dismissals and acquittals are kept with their true status.
- One bar for every party: same sources, same scepticism. Only crimes in the `CRIMES` enum count; political offences are out of scope. Municipal-only cases are out of scope.
- Every record cites HTTPS sources, at least one not Wikipedia.
- Every data run, with or without record changes, is logged in a public changelog at `/cambios`, also available as RSS at `/cambios/feed.xml`.

## Features

- Leaderboard with filters kept in the URL (`?cat&partido&estado&anio&delito&caso&q`). `cat`, `partido`, `estado`, `anio` and `delito` accept several comma-separated values (OR within a facet, AND across facets).
- Suspect detail: causes, charges, convictions, sentences, amount, sources, related suspects and a per-suspect change history. The open suspect is deep-linkable (`#s-<id>`).
- Insights panel: charts of the filtered set (recharts, lazy-loaded only when the panel is open).
- Changelog page and RSS feed.
- SEO: canonical URLs, Open Graph, `robots.txt`, sitemap, `Dataset` JSON-LD.

## Stack

- Next.js 16 (static export), React 19, TypeScript 7 (`tsc`; TypeScript 6 is aliased as `typescript` for typescript-eslint and Next's type check)
- Tailwind CSS v4, Radix UI / shadcn, lucide-react, recharts
- Zod 4 for the data schema
- ESLint 9 (flat config, `eslint-config-next`), tests with `node:test` through `tsx`
- Firebase Hosting, GitHub Actions

## Getting started

Prerequisite: Node.js 20.9 or newer (the minimum Next.js 16 declares; CI uses the runner's default Node).

```bash
npm ci
npm run dev
```

Open <http://localhost:9002>.

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server with Turbopack on port 9002 |
| `npm run build` | Production static export to `out/` |
| `npm run start` | `next start`; does not work with `output: 'export'`. Serve `out/` with any static file server instead |
| `npm run lint` | ESLint, including jsx-a11y rules |
| `npm test` | Unit tests, `src/lib/*.test.ts` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run validate-data` | Validate `data.json` and `changelog.json` against the Zod schema and cross-file rules |

## Project structure

```text
src/
  app/
    page.tsx            Leaderboard (parses data at build time, Dataset JSON-LD)
    layout.tsx          Metadata, canonical, Open Graph
    cambios/page.tsx    Public changelog (/cambios)
    cambios/feed.xml/   RSS route handler
    robots.ts, sitemap.ts
    globals.css         Design tokens (@theme)
  components/           Leaderboard, filters, insights, nav links; ui/ holds shadcn primitives
  lib/
    schema.ts           Single source of truth: Zod schema, types, view derivation
    data.json           The dataset
    changelog.json      Public changelog, newest entry first
    changelog.ts        Parses changelog.json
    filters.ts          URL filter parsing and patches
    insights.ts         Counts behind the charts
    status-ui.ts        Status/category labels, icons, classes
    site.ts             Canonical origin, shared description, content dates
scripts/validate-data.ts   Data validation entry point
.claude/skills/update-data/SKILL.md   Data update procedure
.github/workflows/      Firebase Hosting deploys
firebase.json           Hosting config (public dir: out, cleanUrls)
```

## Data model

`src/lib/schema.ts` is the single source of truth; read its JSDoc for field semantics.

- One record in `data.json` is one suspect (`id`, `suspect`, `title`, `categories`, optional `party`, `startYear`, `lastUpdated`, `sourceUrls`, optional `court` and `summary` up to 300 characters).
- `causes[]` holds each court case the suspect is in, with its own data:
  - `status`: `investigado`, `procesado`, `condenado`, `absuelto` or `sobreseido`.
  - `charges[]` and, only when `condenado`, `convictions[]` (a subset of charges), both from the `CRIMES` enum.
  - `sentence` only when `condenado`: `date`, `prisonMonths`, `disqualificationMonths`, `fineEur`, `suspended`, `firm`.
  - `amount`: total EUR of the whole case, identical for every suspect sharing the cause.
- Suspects sharing a cause name are related. Counts shown in the UI are derived in `deriveView`, never stored.
- `categories` are roles (`gobierno`, `familia`, `partido`, `institucional`, `entorno`); `party` comes from the `PARTIES` enum and is separate.
- `changelog.json` entries: `date`, `summary`, `changes[]` (`nuevo`, `actualizado` or `eliminado`, with record `ids`, `description`, optional `rationale` and `sourceUrls`), `notAdded[]`, `unverifiable[]`, `watchlist[]`, `prs[]`. Text is Spanish.

`npm run validate-data` enforces, among others:

- convictions and sentence present if and only if the cause is `condenado`; convictions are a subset of charges; a sentence has prison, disqualification or a fine;
- unique ids, suspect names and cause names per suspect; same-name causes agree on `amount`;
- HTTPS-only, non-duplicate sources, at least one not Wikipedia;
- changelog entries newest first with unique dates, known record ids, and the newest entry not older than the newest `lastUpdated`.

Never bump `lastUpdated` without a content change.

## Workflows

### Weekly data update

The `/update-data` Claude Code skill (`.claude/skills/update-data/SKILL.md`) is run weekly by a local Claude Code scheduled task:

1. Research per cause (not per suspect). Active causes every run, settled causes monthly. One discovery pass for new qualifying causes.
2. Edit `src/lib/data.json`.
3. Prepend an entry to `src/lib/changelog.json`. This happens on every run, even when no record changed.
4. Run `npm run validate-data && npm run typecheck && npm run build`.
5. Open a PR (`chore(data): case update YYYY-MM-DD`, or `case review` when only the changelog changed).

A human reviews and merges. The skill never merges.

### CI/CD

Both workflows run `npm ci && npm run validate-data && npm run lint && npm test && npm run build`. `npm run typecheck` is not a separate step; Next's build type-checks and type errors fail the build.

- Pull request (`firebase-hosting-pull-request.yml`): a `build` job runs the checks; a `preview` job then repeats them and deploys a Firebase Hosting preview channel. It is skipped for Dependabot and for PRs from forks.
- Push to `main` (`firebase-hosting-merge.yml`): runs the same checks and deploys to the `live` channel of the `corruption-ranking` project.

### Contributing a data correction

1. Edit `src/lib/data.json` following the schema rules above. Cite sources and do not upgrade a status beyond what a court has done.
2. Bump `lastUpdated` on the records you changed, and only those.
3. Prepend an entry to `src/lib/changelog.json` describing the change.
4. Run `npm run validate-data`.
5. Open a PR.

## Disclaimer

No license file is present in the repository. Data comes from press and judicial sources. Statuses describe judicial stages, not findings of guilt.
