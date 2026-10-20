import { strict as assert } from "node:assert";
import { test } from "node:test";
import { CauseSchema } from "./schema";

const convicted = {
  name: "Caso procés",
  status: "condenado",
  charges: ["malversación"],
  convictions: ["malversación"],
  sentence: { date: "2023-02-13", disqualificationMonths: 156, firm: true },
};
const indulto = { kind: "indulto", date: "2021-06-22", scope: "parcial" };
const amnistia = { kind: "amnistía", date: "2026-10-19" };

test("keeps an indulto and a later amnistía on the same cause", () => {
  assert.ok(CauseSchema.safeParse({ ...convicted, clemency: [indulto, amnistia] }).success);
});

test("rejects clemency that is not oldest first", () => {
  assert.equal(CauseSchema.safeParse({ ...convicted, clemency: [amnistia, indulto] }).success, false);
});

test("checks each measure, not just the first", () => {
  const noScope = { kind: "indulto", date: "2026-11-01" };
  assert.equal(CauseSchema.safeParse({ ...convicted, clemency: [amnistia, noScope] }).success, false);
});
