import { strict as assert } from "node:assert";
import { test } from "node:test";
import { DataSchema } from "./schema";
import { causePath, pagePath, partyPath, slugCollisions, suspectPath, suspectPaths, suspectSlug } from "./suspects";
import data from "./data.json";

const suspects = DataSchema.parse(data);

test("strips accents, case and punctuation from a name", () => {
  // Arrange / Act / Assert
  assert.equal(suspectSlug("Álvaro García Ortiz"), "alvaro-garcia-ortiz");
  assert.equal(suspectSlug("José Luis Ábalos"), "jose-luis-abalos");
  assert.equal(suspectSlug("Mónica Oltra Jarque"), "monica-oltra-jarque");
});

test("builds the canonical path of a suspect page", () => {
  assert.equal(suspectPath("Álvaro García Ortiz"), "/sospechoso/alvaro-garcia-ortiz");
});

test("maps ids to paths", () => {
  const paths = suspectPaths([
    { id: 7, suspect: "Álvaro García Ortiz" },
    { id: 9, suspect: "Mónica Oltra Jarque" },
  ]);

  assert.deepEqual(paths, {
    7: "/sospechoso/alvaro-garcia-ortiz",
    9: "/sospechoso/monica-oltra-jarque",
  });
});

test("reports names that collapse to the same slug", () => {
  // normalize() keeps the hyphen apart, slug() does not: a real collision the route cannot serve.
  const clash = slugCollisions([{ suspect: "José Luis" }, { suspect: "José-Luis" }]);

  assert.deepEqual(clash, ["jose-luis"]);
});

test("every slug in the dataset is unique and URL-safe", () => {
  assert.deepEqual(slugCollisions(suspects), []);
  for (const s of suspects) {
    const key = suspectSlug(s.suspect);
    assert.match(key, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${s.suspect} -> "${key}"`);
  }
});

test("builds cause and party page paths", () => {
  assert.equal(causePath("Caso Ábalos/Koldo"), "/caso/caso-abalos-koldo");
  assert.equal(partyPath("pp"), "/partido/pp");
});

test("maps a single-facet filter to its own page, anything else to none", () => {
  assert.equal(pagePath({ caso: "caso-ere" }), "/caso/caso-ere");
  assert.equal(pagePath({ partido: ["psoe"] }), "/partido/psoe");
  assert.equal(pagePath({ partido: ["psoe", "pp"] }), undefined);
  assert.equal(pagePath({ caso: "caso-ere", partido: ["pp"] }), undefined);
  assert.equal(pagePath({ delito: ["cohecho"] }), undefined);
});
