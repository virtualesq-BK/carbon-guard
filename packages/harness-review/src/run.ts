#!/usr/bin/env tsx
// pnpm harness:review — scans the last 30 days of logs/YYYY-MM-DD/*.md,
// tallies repeated workflow/mistake patterns, and writes a draft retro to
// logs/harness-review/<today>.md. Never edits skills/ or CLAUDE.md itself.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { countPatterns, mergeCounts } from "./parse.js";
import { buildReviewReport } from "./report.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");
const LOGS_ROOT = join(REPO_ROOT, "logs");
const REVIEW_OUT_DIR = join(LOGS_ROOT, "harness-review");
const WINDOW_DAYS = 30;

function dateStringsInWindow(now: Date, days: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function readAllLogTexts(now: Date): string[] {
  const texts: string[] = [];
  for (const dateStr of dateStringsInWindow(now, WINDOW_DAYS)) {
    const dir = join(LOGS_ROOT, dateStr);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      texts.push(readFileSync(join(dir, file), "utf-8"));
    }
  }
  return texts;
}

function main() {
  const now = new Date();
  const window = dateStringsInWindow(now, WINDOW_DAYS);
  const periodLabel = `${window[window.length - 1]} ~ ${window[0]}`;

  const texts = readAllLogTexts(now);
  const counts = mergeCounts(texts.map(countPatterns));
  const report = buildReviewReport({ periodLabel, counts });

  mkdirSync(REVIEW_OUT_DIR, { recursive: true });
  const outPath = join(REVIEW_OUT_DIR, `${now.toISOString().slice(0, 10)}.md`);
  writeFileSync(outPath, report);

  console.log(report);
  console.log(`\nharness-review: draft written to logs/harness-review/${now.toISOString().slice(0, 10)}.md`);
}

main();
