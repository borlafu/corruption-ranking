import * as fs from "fs";
import * as path from "path";
import { DataSchema } from "../src/lib/schema";

const DATA_PATH = path.join(__dirname, "../src/lib/data.json");

const result = DataSchema.safeParse(JSON.parse(fs.readFileSync(DATA_PATH, "utf-8")));
if (!result.success) {
  console.error(`data.json failed validation (${result.error.issues.length} issue(s)):`);
  for (const issue of result.error.issues) {
    console.error(`  ${issue.path.join(".") || "<root>"}: ${issue.message}`);
  }
  process.exit(1);
}
console.log(`data.json OK (${result.data.length} records)`);
