import { test } from "node:test";
import assert from "node:assert/strict";
import { DataSchema, deriveView } from "@/lib/schema";
import { applyPatch, filterCases, findCause, parseFilters, slug, toSearch } from "@/lib/filters";
import data from "@/lib/data.json";

const cases = deriveView(DataSchema.parse(data));
const names = (f: Parameters<typeof filterCases>[1]) => filterCases(cases, f).map((c) => c.suspect);

test("query string round-trips through parseFilters/toSearch", () => {
  const search = "?cat=gobierno&partido=psoe&anio=2024&delito=cohecho&caso=caso-koldo&q=abalos";
  assert.equal(toSearch(parseFilters(search)), search);
  assert.equal(toSearch({}), "");
});

test("multi-value filters round-trip with readable commas", () => {
  const search = "?cat=gobierno,familia&partido=psoe,pp&anio=2024,2025";
  assert.deepEqual(parseFilters(search), {
    cat: ["gobierno", "familia"],
    partido: ["psoe", "pp"],
    anio: [2024, 2025],
  });
  assert.equal(toSearch(parseFilters(search)), search);
});

test("drops unknown or malformed params", () => {
  assert.deepEqual(parseFilters("?cat=vox&anio=abc&delito=robo&caso=<x>&q=%20&foo=1"), {});
});

test("keeps the valid members of a list and drops the rest", () => {
  assert.deepEqual(parseFilters("?cat=gobierno,robo,familia,gobierno"), { cat: ["gobierno", "familia"] });
  assert.deepEqual(parseFilters("?anio=2024,abc,,2024"), { anio: [2024] });
  assert.deepEqual(parseFilters("?delito=robo"), {});
});

test("legacy cat=psoe maps to partido=psoe", () => {
  assert.deepEqual(parseFilters("?cat=psoe"), { partido: ["psoe"] });
  assert.deepEqual(parseFilters("?cat=gobierno,psoe&partido=pp"), { cat: ["gobierno"], partido: ["psoe", "pp"] });
  assert.ok(names({ partido: ["psoe"] }).includes("Santos Cerdán"));
});

test("slug strips accents and punctuation", () => {
  assert.equal(slug("Caso Ábalos/Koldo"), "caso-abalos-koldo");
});

test("caso filter returns every suspect in the cause", () => {
  const koldo = names({ caso: "caso-koldo" });
  for (const s of ["Koldo García", "José Luis Ábalos", "Santos Cerdán", "Víctor de Aldama"]) assert.ok(koldo.includes(s), s);
  assert.equal(findCause(cases, "caso-koldo")?.members.length, koldo.length);
  assert.equal(findCause(cases, "caso-inexistente"), undefined);
});

test("search is accent- and case-insensitive", () => {
  assert.ok(names({ q: "ABALOS" }).includes("José Luis Ábalos"));
  assert.deepEqual(names({ q: "ABALOS" }), names({ q: "ábalos" }));
});

test("values in one filter are OR-ed", () => {
  const both = names({ partido: ["pp", "vox"] });
  assert.deepEqual(new Set(both), new Set([...names({ partido: ["pp"] }), ...names({ partido: ["vox"] })]));
  assert.ok(both.length > names({ partido: ["pp"] }).length);
});

test("different filters are AND-ed", () => {
  const anio = [2024, 2025];
  const got = filterCases(cases, { partido: ["psoe"], anio });
  assert.ok(got.length > 0);
  for (const c of got) {
    assert.equal(c.party, "psoe");
    assert.ok(anio.includes(c.startYear));
  }
});

test("applyPatch toggles array values and clears on undefined", () => {
  const one = applyPatch({}, { anio: [2024] });
  assert.deepEqual(one, { anio: [2024] });

  const two = applyPatch(one, { anio: [2025] });
  assert.deepEqual(two, { anio: [2024, 2025] });

  assert.deepEqual(applyPatch(two, { anio: [2024] }), { anio: [2025] });
  // Removing the last value drops the key entirely.
  assert.deepEqual(applyPatch(one, { anio: [2024] }), {});
  assert.deepEqual(applyPatch(two, { anio: undefined }), {});
});

test("applyPatch replaces scalars and never mutates its input", () => {
  const before: Parameters<typeof applyPatch>[0] = { cat: ["gobierno"], q: "abalos" };
  const after = applyPatch(before, { q: "koldo", caso: "caso-koldo" });
  assert.deepEqual(before, { cat: ["gobierno"], q: "abalos" });
  assert.deepEqual(after, { cat: ["gobierno"], q: "koldo", caso: "caso-koldo" });
  assert.deepEqual(applyPatch(after, { q: "" }), { cat: ["gobierno"], caso: "caso-koldo" });
});
