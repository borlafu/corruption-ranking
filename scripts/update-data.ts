import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

const DATA_PATH = path.join(__dirname, "../src/lib/data.json");
const TODAY = new Date().toISOString().slice(0, 10);
const DELAY_MS = 1200;
const MAX_RETRIES = 2;

// ---------------------------------------------------------------------------
// Zod schema (mirrors src/lib/types.ts exactly)
// ---------------------------------------------------------------------------

const CaseSchema = z.object({
  id: z.number().int().positive(),
  suspect: z.string().min(1),
  title: z.string().min(1),
  caseName: z.string().optional(),
  accusations: z.number().int().nonnegative(),
  sentences: z.number().int().nonnegative(),
  category: z.enum(["gobierno", "familia", "psoe", "institucional"]),
  status: z.enum(["investigado", "procesado", "condenado", "sobreseido"]),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  court: z.string().optional(),
  startYear: z.number().int().min(1970).max(2040).optional(),
  amount: z.number().nonnegative().optional(),
  summary: z.string().max(350).optional(),
  relatedCaseIds: z.array(z.number().int().positive()).optional(),
  sourceUrls: z.array(z.string().url()).min(1),
});

type CaseData = z.infer<typeof CaseSchema>;

const DataSchema = z.array(CaseSchema);

// ---------------------------------------------------------------------------
// Anthropic tool definitions
// ---------------------------------------------------------------------------

const UPDATE_TOOL: Anthropic.Tool = {
  name: "update_case",
  description:
    "Provide verified updates for a Spanish corruption case. Only include fields you can confirm from credible sources.",
  input_schema: {
    type: "object" as const,
    properties: {
      status: {
        type: "string",
        enum: ["investigado", "procesado", "condenado", "sobreseido"],
        description: "Most conservative documented legal status",
      },
      accusations: {
        type: "number",
        description: "Number of documented charges/accusations",
      },
      sentences: {
        type: "number",
        description: "Number of court sentences handed down",
      },
      court: {
        type: "string",
        description: "Court or investigating body (e.g. Tribunal Supremo)",
      },
      amount: {
        type: "number",
        description: "Amount defrauded in EUR, if documented",
      },
      summary: {
        type: "string",
        description: "Factual 1-2 sentence summary, max 300 chars",
      },
      newSourceUrls: {
        type: "array",
        items: { type: "string" },
        description: "Additional credible source URLs not yet in sourceUrls",
      },
    },
    required: ["status"],
  },
};

const DISCOVER_TOOL: Anthropic.Tool = {
  name: "new_cases",
  description: "Report new Spanish government/PSOE corruption cases from 2024-2026 not in the existing dataset",
  input_schema: {
    type: "object" as const,
    properties: {
      cases: {
        type: "array",
        items: {
          type: "object",
          properties: {
            suspect: { type: "string" },
            title: { type: "string" },
            caseName: { type: "string" },
            accusations: { type: "number" },
            sentences: { type: "number" },
            category: {
              type: "string",
              enum: ["gobierno", "familia", "psoe", "institucional"],
            },
            status: {
              type: "string",
              enum: ["investigado", "procesado", "condenado", "sobreseido"],
            },
            court: { type: "string" },
            startYear: { type: "number" },
            summary: { type: "string" },
            sourceUrls: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["suspect", "title", "accusations", "sentences", "category", "status", "sourceUrls"],
        },
        description: "Array of new cases to add. Empty array if none found.",
      },
    },
    required: ["cases"],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callWithRetry<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T | null> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const delay = Math.pow(2, attempt + 1) * 1000;
      if (attempt < MAX_RETRIES) {
        console.warn(`[${label}] attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        console.error(`[${label}] all retries exhausted:`, err);
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  const rawData = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const parseResult = DataSchema.safeParse(rawData);
  if (!parseResult.success) {
    console.error("Existing data.json failed schema validation:", parseResult.error.format());
    process.exit(1);
  }

  const cases: CaseData[] = parseResult.data;
  const updatedCases: CaseData[] = [];
  const changeLog: string[] = [];

  const systemPrompt = `You are a research assistant compiling public legal records about Spanish corruption cases.
Return ONLY information that is documented in Spanish court records, official government sources,
or major Spanish newspapers (El País, El Mundo, RTVE, ABC, El Confidencial, poderjudicial.es, elconfidencial.com).
Do NOT speculate about guilt or innocence.
Do NOT extrapolate beyond documented facts.
If uncertain about a field, omit it.
Always set status to the most conservative documented legal status.
Status meanings: investigado=under investigation, procesado=formally charged, condenado=convicted, sobreseido=case dismissed.`;

  console.log(`\nUpdating ${cases.length} existing cases...\n`);

  for (const c of cases) {
    await sleep(DELAY_MS);

    const result = await callWithRetry(async () => {
      const response = await client.messages.create({
        model: "claude-opus-4-8",
        max_tokens: 1024,
        system: systemPrompt,
        tools: [UPDATE_TOOL],
        tool_choice: { type: "auto" },
        messages: [
          {
            role: "user",
            content: `Update the following corruption case with the latest verified information as of ${TODAY}.
Current data: ${JSON.stringify(c, null, 2)}

Provide updates via the update_case tool. Focus on:
- Current legal status (status)
- Latest accusation/sentence counts if changed
- Court or investigating body if known
- A factual summary (max 300 chars) if not present or outdated
- Any additional credible source URLs published after the existing ones`,
          },
        ],
      });

      const toolUse = response.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );
      return toolUse?.input as Record<string, unknown> | undefined;
    }, `case:${c.id}:${c.suspect}`);

    if (!result) {
      console.log(`  [${c.id}] ${c.suspect} -- skipped (API error)`);
      updatedCases.push(c);
      continue;
    }

    const existingUrls = new Set(c.sourceUrls);
    const newUrls = Array.isArray(result.newSourceUrls)
      ? (result.newSourceUrls as string[]).filter(
          (u) => typeof u === "string" && !existingUrls.has(u)
        )
      : [];

    const updated: CaseData = {
      ...c,
      status: (result.status as CaseData["status"]) ?? c.status,
      accusations: typeof result.accusations === "number" ? result.accusations : c.accusations,
      sentences: typeof result.sentences === "number" ? result.sentences : c.sentences,
      court: typeof result.court === "string" ? result.court : c.court,
      amount: typeof result.amount === "number" ? result.amount : c.amount,
      summary: typeof result.summary === "string" ? result.summary.slice(0, 350) : c.summary,
      sourceUrls: [...c.sourceUrls, ...newUrls],
      lastUpdated: TODAY,
    };

    const validation = CaseSchema.safeParse(updated);
    if (!validation.success) {
      console.warn(`  [${c.id}] ${c.suspect} -- validation failed, keeping original`);
      updatedCases.push(c);
      continue;
    }

    const changed: string[] = [];
    if (updated.status !== c.status) changed.push(`status: ${c.status} -> ${updated.status}`);
    if (updated.accusations !== c.accusations) changed.push(`accusations: ${c.accusations} -> ${updated.accusations}`);
    if (updated.sentences !== c.sentences) changed.push(`sentences: ${c.sentences} -> ${updated.sentences}`);
    if (newUrls.length > 0) changed.push(`+${newUrls.length} source(s)`);
    if (!c.summary && updated.summary) changed.push("summary added");

    if (changed.length > 0) {
      const msg = `  [${c.id}] ${c.suspect}: ${changed.join(", ")}`;
      console.log(msg);
      changeLog.push(msg);
    } else {
      console.log(`  [${c.id}] ${c.suspect}: no changes`);
    }

    updatedCases.push(validation.data);
  }

  console.log("\nSearching for new cases...\n");
  const existingSuspects = new Set(cases.map((c) => c.suspect.toLowerCase()));

  await sleep(DELAY_MS);

  const newCasesResult = await callWithRetry(async () => {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2048,
      system: systemPrompt,
      tools: [DISCOVER_TOOL],
      tool_choice: { type: "auto" },
      messages: [
        {
          role: "user",
          content: `Search your knowledge for significant Spanish government or PSOE corruption cases from 2024-2026 NOT already in this dataset.

Existing suspects: ${Array.from(existingSuspects).join(", ")}

Return new cases via the new_cases tool. Criteria:
- Must involve members of the Spanish government, PSOE party, or family of government members
- Must have documented accusations or formal investigation opened
- Must have at least one credible source URL (El Pais, El Mundo, RTVE, ABC, El Confidencial, poderjudicial.es)
- Only include cases with documented public record -- no speculation

If no significant new cases exist, return an empty array.`,
        },
      ],
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );
    return toolUse?.input as { cases: unknown[] } | undefined;
  }, "discover:new-cases");

  let nextId = Math.max(...cases.map((c) => c.id)) + 1;

  if (newCasesResult?.cases && Array.isArray(newCasesResult.cases)) {
    for (const rawCase of newCasesResult.cases) {
      const candidate: Record<string, unknown> = {
        ...(rawCase as Record<string, unknown>),
        id: nextId,
        lastUpdated: TODAY,
        relatedCaseIds: [],
      };

      const suspectName = candidate.suspect;
      if (
        typeof suspectName === "string" &&
        existingSuspects.has(suspectName.toLowerCase())
      ) {
        console.log(`  Skipping duplicate: ${suspectName}`);
        continue;
      }

      const validation = CaseSchema.safeParse(candidate);
      if (!validation.success) {
        console.warn(`  Skipping invalid new case (${String(suspectName ?? "unknown")}):`, validation.error.format());
        continue;
      }

      console.log(`  + New case [${nextId}]: ${validation.data.suspect} (${validation.data.caseName ?? "--"})`);
      changeLog.push(`  + NEW [${nextId}] ${validation.data.suspect}`);
      updatedCases.push(validation.data);
      nextId++;
    }
  }

  const finalValidation = DataSchema.safeParse(updatedCases);
  if (!finalValidation.success) {
    console.error("\nFinal dataset failed validation -- aborting write:", finalValidation.error.format());
    process.exit(1);
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(finalValidation.data, null, 2) + "\n", "utf-8");

  console.log("\n--- Summary ---");
  if (changeLog.length === 0) {
    console.log("No changes detected.");
  } else {
    changeLog.forEach((l) => console.log(l));
  }
  console.log(`\n${updatedCases.length} cases written to ${DATA_PATH}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
