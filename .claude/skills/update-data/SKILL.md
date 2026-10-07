---
name: update-data
description: Refresh src/lib/data.json (España Corrupta leaderboard) with web-verified developments for every suspect, discover new qualifying cases, validate, and open a PR. Use when asked to update, refresh, or fact-check the corruption data.
---

# /update-data

Refreshes `src/lib/data.json` from primary and press sources, then opens a PR. Merging the PR deploys to Firebase, so never merge from this skill.

## Field semantics (binding)

Schema and JSDoc live in `src/lib/schema.ts`. Summary:

- One record = one **suspect** (person). `causes[]` = the court cases they are in, each with its own `status`.
- `status` per cause: `investigado` (imputado by a court), `procesado` (auto de procesamiento or apertura de juicio oral), `condenado` (convicted, even if appealed), `absuelto`, `sobreseido` (archived). A querella or denuncia alone is **not** `investigado`; a person with no court-opened cause does not belong in the dataset.
- `accusations` = distinct crimes (delitos) charged across all causes. `sentences` = distinct crimes convicted of, not number of rulings. `sentences <= accusations`; `sentences > 0` iff some cause is `condenado`.
- `categories`: `gobierno` (member of central government, past or present), `familia` (family of a government member), `psoe` (party official/member), `institucional` (public servant or public body officer), `entorno` (businessman or private intermediary). A suspect can have several.
- `amount`: total EUR of the whole case, on the cause, identical for every suspect sharing that cause.
- `court`: court that issued the last ruling or is instructing. Note appeals in `summary`.
- `summary`: Spanish, factual, ≤ 300 chars, dated milestones ("22-jun-2026").
- `lastUpdated`: bump to today **only** on records whose content changed.
- `sourceUrls`: https only, no duplicates, at least one non-Wikipedia source. Only URLs that appeared in a search result or were fetched successfully. Never construct a URL.

Preferred sources: poderjudicial.es, elpais.com, elmundo.es, rtve.es, abc.es, elconfidencial.com, elespanol.com, elperiodico.com, europapress.es, efe.com, eldiario.es, infobae.com/espana. Treat partisan outlets as leads to confirm elsewhere.

## Steps

1. **Prepare**: `git checkout main && git pull`, then branch `data/update-YYYY-MM-DD`. Read `src/lib/data.json` and `src/lib/schema.ts`.
2. **Per-suspect research**: for each record, WebSearch "<suspect> <cause name>" restricted to developments after that record's `lastUpdated`. Batch suspects across sonnet subagents (about 10 per agent); each agent returns, per record: verdict (CORRECT / OUTDATED / WRONG / UNVERIFIABLE), changed fields only, 1–3 URLs with dates, confidence. The main agent decides every edit. Before changing `status` or counts, confirm with a second source or a WebFetch of the article.
3. **Discovery**: one search pass for new cases opened or escalated since the newest `lastUpdated` involving the categories above. Dedup against existing records by normalised suspect name and by cause name. Add only cases that meet the court-opened bar.
4. **Edit** `data.json`: apply changes, preserve ids, new ids = max + 1. Remove a record only if it fails the court-opened bar; say why in the PR body.
5. **Verify**:
   ```bash
   npm run validate-data && npm run typecheck && npm run build
   ```
   Fix every validator issue; do not relax the schema to make data pass.
6. **Publish**: commit `chore(data): case update YYYY-MM-DD` with a body listing per-record changes; push; `gh pr create --base main` with the same changelog plus a review checklist (status changes verified against sources, counts recounted, removals justified). Do not merge.
7. **Report**: changelog summary, records left UNVERIFIABLE, and anything on the watchlist (complaints not yet admitted, imputación pending).
