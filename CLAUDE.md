# corruption-ranking

## Commands

- **Dev**: `npm run dev` → Next.js + Turbopack on port 9002
- **Build**: `npm run build` (static export via `output: 'export'`)
- **Lint**: `npm run lint`
- **Typecheck**: `npm run typecheck` (`tsc --noEmit`)

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI / shadcn, Recharts, React Hook Form.

## Notes

- Static export — no server-side runtime. API routes not supported.
- `ignoreBuildErrors: true` in next.config.ts — type errors won't fail build but `typecheck` script will catch them.
- No test suite configured. Consider adding Vitest + React Testing Library.
