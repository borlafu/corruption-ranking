import * as fs from "fs";
import * as path from "path";
import { ChangelogSchema, DataSchema, changelogIssues } from "../src/lib/schema";

const DATA_PATH = path.join(__dirname, "../src/lib/data.json");
const CHANGELOG_PATH = path.join(__dirname, "../src/lib/changelog.json");

const result = DataSchema.safeParse(JSON.parse(fs.readFileSync(DATA_PATH, "utf-8")));
if (!result.success) {
  console.error(`data.json failed validation (${result.error.issues.length} issue(s)):`);
  for (const issue of result.error.issues) {
    console.error(`  ${issue.path.join(".") || "<root>"}: ${issue.message}`);
  }
  process.exit(1);
}
console.log(`data.json OK (${result.data.length} records)`);

const log = ChangelogSchema.safeParse(JSON.parse(fs.readFileSync(CHANGELOG_PATH, "utf-8")));
const logIssues = log.success
  ? changelogIssues(log.data, result.data)
  : log.error.issues.map((i) => `${i.path.join(".") || "<root>"}: ${i.message}`);
if (logIssues.length) {
  console.error(`changelog.json failed validation (${logIssues.length} issue(s)):`);
  for (const message of logIssues) console.error(`  ${message}`);
  process.exit(1);
}
console.log(`changelog.json OK (${log.data!.length} entries)`);
