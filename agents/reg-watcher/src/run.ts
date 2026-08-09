#!/usr/bin/env tsx
// Weekly (or manual `pnpm agent:reg-watch`) pipeline: for each verified source
// in sources.yaml, fetch its content, compare against the last-seen hash, and
// if changed, write a proposal markdown file under packages/ruleset/proposals/
// — never touching factors/ or regulations/ directly. A human reviews the
// proposal and edits the ruleset (+ changelog.md) themselves.
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchSourceText } from "./fetch-source.js";
import { computeContentHash, hasChanged } from "./hash.js";
import {
  formatLogEntry,
  formatNoChangeLogEntry,
  formatSkippedUnverifiedLogEntry,
  logDatePath,
} from "./log.js";
import { buildProposalMarkdown, proposalFileName } from "./proposal.js";
import { loadSources, sourceId, type Source } from "./sources.js";
import { readSourceState, writeSourceState } from "./state-store.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_ROOT = join(__dirname, "..", "..", "..", "logs");
const PROPOSALS_ROOT = join(__dirname, "..", "..", "..", "packages", "ruleset", "proposals");

function appendLog(entry: string, now: Date = new Date()) {
  const dir = join(LOGS_ROOT, logDatePath(now));
  mkdirSync(dir, { recursive: true });
  appendFileSync(join(dir, "reg-watcher.md"), entry);
}

async function processSource(source: Source, now: Date): Promise<void> {
  if (!source.verified) {
    appendLog(formatSkippedUnverifiedLogEntry(source, now));
    console.log(`reg-watcher: skipped unverified source "${source.key}" (${source.url})`);
    return;
  }

  const id = sourceId(source);
  const previous = readSourceState(id);
  const text = await fetchSourceText(source.url);
  const newHash = computeContentHash(text);

  if (!hasChanged(previous?.lastHash ?? null, newHash)) {
    appendLog(formatNoChangeLogEntry(source, now));
    writeSourceState(id, { lastHash: newHash, lastCheckedAt: now.toISOString() });
    console.log(`reg-watcher: no change for "${source.key}" (${source.url})`);
    return;
  }

  const proposal = buildProposalMarkdown({
    source,
    previousHash: previous?.lastHash ?? null,
    newHash,
    fetchedAt: now,
  });
  const fileName = proposalFileName(source, now);
  mkdirSync(PROPOSALS_ROOT, { recursive: true });
  writeFileSync(join(PROPOSALS_ROOT, fileName), proposal);

  const reasoning =
    previous === null
      ? "최초 조회 (기존 저장된 해시 없음)"
      : `내용 해시 변경 감지 (${previous.lastHash.slice(0, 8)}… → ${newHash.slice(0, 8)}…)`;
  appendLog(formatLogEntry(source, reasoning, `packages/ruleset/proposals/${fileName}`, now));
  writeSourceState(id, { lastHash: newHash, lastCheckedAt: now.toISOString() });

  console.log(`reg-watcher: proposal written for "${source.key}" → packages/ruleset/proposals/${fileName}`);
}

async function main() {
  const now = new Date();
  const sources = loadSources();

  for (const source of sources) {
    try {
      await processSource(source, now);
    } catch (err) {
      console.error(`reg-watcher: failed to process source "${source.key}" (${source.url}):`, err);
    }
  }
}

main().catch((err) => {
  console.error("reg-watcher failed:", err);
  process.exit(1);
});
