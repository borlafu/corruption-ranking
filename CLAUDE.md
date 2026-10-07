# corruption-ranking

## Commands

- **Dev**: `npm run dev` → Next.js + Turbopack on port 9002
- **Build**: `npm run build` (static export via `output: 'export'`)
- **Lint**: `npm run lint`
- **Typecheck**: `npm run typecheck` (`tsc --noEmit`)
- **Validate data**: `npm run validate-data` (Zod schema + dataset rules on `src/lib/data.json`; runs in CI before build)

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI / shadcn, Zod, React Hook Form.

## Data

- `src/lib/schema.ts` is the single source of truth (Zod schema, derived TS types, UI view derivation). No separate types file.
- One record = one suspect; `causes[]` holds each court case with its own `status`. Related suspects are those sharing a cause name.
- Each cause carries `charges[]`/`convictions[]` from the `CRIMES` enum and, when condenado, a `sentence` (date, prison/disqualification months, fine, `firm`). Counts shown in the UI are derived in `deriveView`, never stored. `amount` is per case, on the cause.
- Never bump `lastUpdated` without a content change. Never cite Wikipedia alone. Only court-opened causes (imputado/procesado/condenado/absuelto/sobreseido) qualify; complaints alone do not.
- Updates: `/update-data` skill (`.claude/skills/update-data/SKILL.md`), run weekly by a local Claude Code scheduled task; it opens a PR, merge deploys.

## Notes

- Static export — no server-side runtime. API routes not supported. `page.tsx` parses data at build time.
- `ignoreBuildErrors: true` in next.config.ts — type errors won't fail build but `typecheck` script will catch them.
- No test suite; `validate-data` is the data regression check.
