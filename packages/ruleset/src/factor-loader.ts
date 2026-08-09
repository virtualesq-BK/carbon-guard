import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FactorFileSchema, type FactorFile } from "./schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const FACTORS_ROOT = join(__dirname, "..", "factors");

export class UnresolvedFactorError extends Error {}
export class FactorNotFoundError extends Error {}

function walkJsonFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walkJsonFiles(full));
    } else if (entry.endsWith(".json")) {
      files.push(full);
    }
  }
  return files;
}

/** Loads and validates every factor JSON file under packages/ruleset/factors. */
export function loadAllFactors(root: string = FACTORS_ROOT): FactorFile[] {
  return walkJsonFiles(root).map((filePath) => {
    const raw = JSON.parse(readFileSync(filePath, "utf-8"));
    const parsed = FactorFileSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Invalid factor file ${filePath}: ${parsed.error.message}`);
    }
    return parsed.data;
  });
}

/**
 * Resolves the factor version applicable to `factorKey` on `atDate`, choosing
 * among overlapping [effective_from, effective_to) windows by most recent
 * effective_from. Throws UnresolvedFactorError if the applicable version is
 * still a "TODO" placeholder — callers (emission-engine) must never silently
 * substitute a guessed number.
 */
export function resolveFactor(
  factorKey: string,
  atDate: string | Date,
  root: string = FACTORS_ROOT
): FactorFile {
  const date = typeof atDate === "string" ? atDate : atDate.toISOString().slice(0, 10);

  const candidates = loadAllFactors(root).filter((f) => f.factor_key === factorKey);
  if (candidates.length === 0) {
    throw new FactorNotFoundError(`No factor versions found for factor_key "${factorKey}"`);
  }

  const applicable = candidates.filter(
    (f) => f.effective_from <= date && (f.effective_to === null || date <= f.effective_to)
  );
  if (applicable.length === 0) {
    throw new FactorNotFoundError(
      `No version of "${factorKey}" is effective on ${date} (checked ${candidates.length} version(s))`
    );
  }

  applicable.sort((a, b) => (a.effective_from < b.effective_from ? 1 : -1));
  const chosen = applicable[0];

  if (chosen.value === "TODO") {
    throw new UnresolvedFactorError(
      `Factor "${factorKey}" version "${chosen.version}" is unconfirmed (value=TODO). ` +
        `It must be proposed by reg-watcher with a source URL and approved by a human ` +
        `before it can be used in a calculation.`
    );
  }

  return chosen;
}
