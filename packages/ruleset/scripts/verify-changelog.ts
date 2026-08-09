#!/usr/bin/env tsx
// Pre-commit gate: fails if any staged factors/ or regulations/ file lacks a
// changelog.md entry mentioning its path. Wired into hooks/ in Phase 8.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { checkChangelogCoversFiles } from "../src/changelog.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rulesetRoot = join(__dirname, "..");

function getStagedFiles(): string[] {
  let output: string;
  try {
    output = execSync("git diff --cached --name-only", { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] });
  } catch {
    console.log("verify-changelog: not inside a git repository (or no commits yet), skipping.");
    return [];
  }
  return output
    .split("\n")
    .filter(Boolean)
    .filter((f) => f.includes("packages/ruleset/"))
    .map((f) => relative("packages/ruleset", f).replace(/\\/g, "/"));
}

function main() {
  const changed = getStagedFiles();
  if (changed.length === 0) {
    console.log("verify-changelog: no staged packages/ruleset files, skipping.");
    return;
  }

  const changelogContent = readFileSync(join(rulesetRoot, "changelog.md"), "utf-8");
  const result = checkChangelogCoversFiles(changelogContent, changed);

  if (!result.ok) {
    console.error("verify-changelog: missing changelog.md entries for:");
    for (const f of result.missing) console.error(`  - ${f}`);
    console.error(
      "\nAdd an entry to packages/ruleset/changelog.md (누가/근거 URL/변경 요약) before committing."
    );
    process.exit(1);
  }

  console.log("verify-changelog: all staged ruleset changes are documented.");
}

main();
