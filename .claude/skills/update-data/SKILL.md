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
- `causes[].charges` = distinct crimes charged in that cause, values from the `CRIMES` enum in `schema.ts` (add an enum value rather than free text). `causes[].convictions` ⊆ charges, only when `condenado`. The UI derives "Acusaciones"/"Condenas" counts from these; never store counts.
- `causes[].sentence` only when `condenado`: `{ date, prisonMonths?, disqualificationMonths?, fineEur?, suspended?, firm }`. `firm: false` while an appeal or re-sentencing is pending.
- `startYear` (required) = year the suspect entered the case; drives the "Año" column and filter.
- `categories` (roles): `gobierno` (member of central or regional government, past or present), `familia` (family of a government member), `partido` (party official or member with no public office), `institucional` (public servant, legislator or public body officer), `entorno` (businessman or private intermediary). A suspect can have several.
- `party`: party the suspect belonged to when the facts occurred, from the `PARTIES` enum (add a value rather than free text). Omit for non-members.
- **Scope**: every party, national and regional level (no municipal-only cases), causes still open or resolved on or after 2018-01-01.
- `amount`: total EUR of the whole case, on the cause, identical for every suspect sharing that cause.
- `court`: court that issued the last ruling or is instructing. Note appeals in `summary`.
- `summary`: Spanish, factual, ≤ 300 chars, dated milestones ("22-jun-2026").
- `lastUpdated`: bump to today **only** on records whose content changed.
- `sourceUrls`: https only, no duplicates, at least one non-Wikipedia source. Only URLs that appeared in a search result or were fetched successfully. Never construct a URL.

Preferred sources: poderjudicial.es, elpais.com, elmundo.es, rtve.es, abc.es, elconfidencial.com, elespanol.com, elperiodico.com, europapress.es, efe.com, eldiario.es, infobae.com/espana. Treat partisan outlets of any side as leads to confirm elsewhere.

## Party neutrality (binding)

The dataset covers every party, so the only defensible position is one bar applied identically. Concretely:

- **Same bar, same sources, same scepticism** for every party. Never accept a thinner source for a party than you would demand for another.
- **A dismissal is data.** Record `sobreseido` and `absuelto` causes with their true status and keep them. Dropping exculpatory outcomes while keeping accusations is the most likely way this dataset becomes dishonest.
- **What is corruption here**: only charges that exist in the `CRIMES` enum. Political offences are out of scope — for the procés causes, include a suspect only on the `malversación` limb, never on a `rebelión`, `sedición` or `desobediencia` limb alone, and do not add enum values for those. The same applies to any future cause whose charges are political rather than venal.
- **Relatives' private affairs are out of scope.** A `familia` suspect qualifies only when the cause touches public office (contracts, posts, aid, influence over an administration). Alberto González Amador (partner of Isabel Díaz Ayuso) stays out: his tax-fraud case and the Quirón commission piece (Fernando Camino) are private business with no public office involved. Revisit only if a court links Ayuso or the Comunidad de Madrid to it.
- **Clemency keeps the case.** An indulto or an applied amnistía never changes `status` and never removes a record: an indulto remits (part of) the penalty, not the conviction, and an amnistía is flagged the same way so the facts stay on the record. Record it in `causes[].clemency` (`kind`, `date` of the Consejo de Ministros decision or the ruling applying it, `scope` total/parcial for indultos) and in the summary. Pending: an amnistía ruling on the procés malversación would flag 94–100, and the TSJC's on the 1-O would flag 107–108.
- **Charges are not convictions.** `investigado` is a judicial stage, not guilt; the UI shows the stage, so never upgrade a status to make a case read as stronger.
- **Coverage is part of neutrality.** A party under-covered because nobody searched for it looks clean in the leaderboard. When a discovery pass finds nothing for a party that holds office, say so explicitly in the PR body rather than leaving a silent gap. Current distribution is in the PR body of each data PR; a large asymmetry is a prompt to check the research, not a finding in itself.

## Steps

1. **Prepare**: `git checkout main && git pull`, then branch `data/update-YYYY-MM-DD`. Read `src/lib/data.json` and `src/lib/schema.ts`.
2. **Per-cause research** — research **causes, not suspects**. Rulings land on a cause and move every suspect in it at once, so one pass per cause is both cheaper and more consistent than one per record (154 records sit in 43 causes; Caso ERE alone holds 21).

   Group the records by `causes[].name`, then split the causes into two tiers:
   - **Active** — any suspect in the cause is `investigado` or `procesado`, or `condenado` with `sentence.firm: false`. Research these **every run** (currently 26 of 43 causes).
   - **Settled** — every suspect in the cause is `absuelto`, `sobreseido`, or `condenado` with `firm: true`. Research these **once a month**, and otherwise only when step 3 surfaces news naming them. A firm sentence does not reopen itself; an amparo or an Estrasburgo ruling can, which is what the monthly sweep catches.

   Batch active causes across sonnet subagents (about 5 causes per agent, not 10 suspects). Give each agent the cause name, its suspects with their current status, and the newest `lastUpdated` among them. Each agent returns, per cause: verdict (CORRECT / OUTDATED / WRONG / UNVERIFIABLE), which suspects changed and in what field, 1–3 URLs with dates, confidence. The main agent decides every edit. Before changing `status`, `sentence` or `amount`, confirm with a second source or a WebFetch of the article.

   Cause-level invariants to check while you are there: every suspect sharing a cause name carries the same `amount`, and a ruling that hit the whole cause is reflected on all of its suspects, not just the one the article named.
3. **Discovery**: one search pass for causes opened or escalated since the newest `lastUpdated`, within the scope above — search the judicial news, then read the party off the results. Do **not** run a pass per party: that was the one-off backfill shape and it costs ten searches to find what one finds. Add a targeted per-party search only when a party that holds national or regional office has had no new record for several months, to tell a genuine absence from an unsearched gap. Dedup against existing records by normalised suspect name **and** by cause name — a suspect already present who joins a new cause gets the cause appended to their `causes[]`, never a second record. Add only causes that meet the court-opened bar.
4. **Edit** `data.json`: apply changes, preserve ids, new ids = max + 1. Remove a record only if it fails the court-opened bar; say why in the PR body.
5. **Verify**:
   ```bash
   npm run validate-data && npm run typecheck && npm run build
   ```
   Fix every validator issue; do not relax the schema to make data pass.
6. **Changelog** — **every run**, even when no record changed: prepend one entry to `src/lib/changelog.json` (shape: `ChangelogEntrySchema` in `schema.ts`; rendered at `/cambios`). Spanish, factual, same neutrality as the data. `summary` says what was reviewed (active causes, settled sweep or not, discovery) and the outcome; `changes[]` one item per record or per cause-wide ruling with current `ids`, `description`, `rationale` and the confirming `sourceUrls`, plus `statusChange: { cause, from, to }` whenever a status moved (split the change if suspects moved differently); `notAdded[]` every candidate found and left out, with the reason; `unverifiable[]` cause names; `watchlist[]` pending rulings with the `ids` each will move, imputaciones pending, complaints not yet admitted. A run with no record changes keeps `changes: []` — that entry is the public record that the review happened. Re-run `npm run validate-data`: it rejects unknown ids, out-of-order dates and a newest entry older than the newest `lastUpdated`.
7. **Publish**: commit `chore(data): case update YYYY-MM-DD` (or `chore(data): case review YYYY-MM-DD` when only the changelog changed) with a body listing per-record changes; push; `gh pr create --base main` with the same changelog plus a review checklist (status changes verified against sources, counts recounted, removals justified). Do not merge.
8. **Report**: changelog summary, records left UNVERIFIABLE, the record count by party, and the watchlist — complaints not yet admitted, imputación pending, and **causes awaiting a ruling with the suspects each ruling will move** (a sentence landing on a 21-suspect cause is 21 status changes next run, so name them in advance).
