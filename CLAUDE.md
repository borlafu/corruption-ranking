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
- Each cause carries `charges[]`/`convictions[]` from the `CRIMES` enum and, when condenado, a `sentence` (date, prison/disqualification months, fine, `firm`). Counts shown in the UI are derived in `deriveView`, never stored. `amount` is per case, on the cause.
- Never bump `lastUpdated` without a content change. Never cite Wikipedia alone. Only court-opened causes (imputado/procesado/condenado/absuelto/sobreseido) qualify; complaints alone do not. Scope: all parties, national + regional (no municipal), causes open or resolved since 2018-01-01.
- Updates: `/update-data` skill (`.claude/skills/update-data/SKILL.md`), run weekly by a local Claude Code scheduled task; it opens a PR, merge deploys. Research is per cause, not per suspect (43 causes hold the records); settled causes are swept monthly.

## Notes

- Static export — no server-side runtime. API routes not supported. `page.tsx` parses data at build time.
- Type errors fail the build. `validate-data` is the data regression check; `npm test` covers URL filter logic.

## Frontend

- Design tokens live in `src/app/globals.css` `@theme` (single dark theme; text colors AA on `--color-card`). Status/category labels, icons and classes: `src/lib/status-ui.ts`.
- Filters and the open suspect live in the URL (`?cat&partido&anio&delito&caso&q#s-<id>`), parsed by `src/lib/filters.ts`. Entity links use `FilterLink`/`SuspectLink` from `src/components/nav.tsx`; add new cross-links through them rather than local state.
