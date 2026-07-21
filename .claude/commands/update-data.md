# /update-data

Refreshes `src/lib/data.json` with the latest Spanish corruption case information using the Claude API, then guides you through reviewing and committing the changes.

## Prerequisites

- `ANTHROPIC_API_KEY` must be set in your environment
- Run `npm install` first to ensure `tsx`, `@anthropic-ai/sdk`, and `zod` are installed

## Steps

1. Check API key is present:
   ```
   echo "${ANTHROPIC_API_KEY:0:7}..."
   ```

2. Run the update script:
   ```
   npm run update-data
   ```

3. Review the changes:
   ```
   git diff src/lib/data.json
   ```

4. Run type checking to verify schema compatibility:
   ```
   node_modules/.bin/tsc --noEmit
   ```

5. Run a production build to verify the static export compiles:
   ```
   npm run build
   ```

6. If the changes look correct, commit:
   ```
   git add src/lib/data.json
   git commit -m "chore(data): manual case update $(date +%Y-%m-%d)"
   ```

## What the script does

- Calls `claude-opus-4-8` for each existing case to research its current legal status, court, and any new source URLs
- Makes one additional call to discover new PSOE/government cases from 2024-2026 not yet in the dataset
- Validates all output against a Zod schema before writing — keeps the original if validation fails
- Never removes existing cases
- Sets `lastUpdated` to today's date on modified cases

## Safety

The script never auto-commits. All changes require explicit `git add` + `git commit`. The GitHub Actions workflow (`.github/workflows/update-data.yml`) creates a PR for human review before any live deployment — it does not merge automatically.

## Automated schedule

The same script runs weekly via GitHub Actions every Monday at 08:00 UTC. You can trigger it manually from the GitHub Actions tab using the `workflow_dispatch` event.
