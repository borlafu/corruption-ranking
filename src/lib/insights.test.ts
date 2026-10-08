import { test } from "node:test";
import assert from "node:assert/strict";
import { DataSchema, deriveView, STATUSES } from "@/lib/schema";
import { NO_PARTY, statusCounts, yearPartyRows } from "@/lib/insights";
import data from "@/lib/data.json";

const cases = deriveView(DataSchema.parse(data));

test("statusCounts covers every status and totals the input", () => {
  const counts = statusCounts(cases);
  assert.deepEqual(
    counts.map((c) => c.status),
    [...STATUSES]
  );
  assert.equal(
    counts.reduce((sum, c) => sum + c.count, 0),
    cases.length
  );
});

test("statusCounts keeps zero rows", () => {
  const counts = statusCounts(cases.filter((c) => c.status === "condenado"));
  assert.equal(counts.length, STATUSES.length);
  assert.equal(counts.filter((c) => c.count > 0).length, 1);
});

test("yearPartyRows fills year gaps and totals the input", () => {
  const { rows, keys } = yearPartyRows(cases);
  const years = rows.map((r) => r.year);

  assert.equal(years[0], Math.min(...cases.map((c) => c.startYear)));
  assert.equal(years.at(-1), Math.max(...cases.map((c) => c.startYear)));
  // Consecutive years, so a gap in the data shows up as an empty column.
  assert.deepEqual(years, Array.from({ length: years.length }, (_, i) => years[0] + i));
  assert.ok(rows.some((r) => keys.every((k) => (r[k] ?? 0) === 0)));

  const total = rows.reduce((sum, r) => sum + keys.reduce((n, k) => n + (r[k] ?? 0), 0), 0);
  assert.equal(total, cases.length);
});

test("yearPartyRows groups unaffiliated suspects under NO_PARTY", () => {
  const { rows, keys } = yearPartyRows(cases);
  assert.ok(keys.includes(NO_PARTY));
  assert.equal(
    rows.reduce((sum, r) => sum + (r[NO_PARTY] ?? 0), 0),
    cases.filter((c) => !c.party).length
  );
});

test("yearPartyRows handles an empty selection", () => {
  assert.deepEqual(yearPartyRows([]), { rows: [], keys: [] });
});
