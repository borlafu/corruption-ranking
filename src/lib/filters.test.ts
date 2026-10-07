import { test } from "node:test";
import assert from "node:assert/strict";
import { DataSchema, deriveView } from "@/lib/schema";
import { filterCases, findCause, parseFilters, slug, toSearch } from "@/lib/filters";
import data from "@/lib/data.json";

const cases = deriveView(DataSchema.parse(data));
const names = (f: Parameters<typeof filterCases>[1]) => filterCases(cases, f).map((c) => c.suspect);

test("query string round-trips through parseFilters/toSearch", () => {
  const search = "?cat=psoe&anio=2024&delito=cohecho&caso=caso-koldo&q=abalos";
  assert.equal(toSearch(parseFilters(search)), search);
  assert.equal(toSearch({}), "");
});

test("drops unknown or malformed params", () => {
  assert.deepEqual(parseFilters("?cat=vox&anio=abc&delito=robo&caso=<x>&q=%20&foo=1"), {});
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
