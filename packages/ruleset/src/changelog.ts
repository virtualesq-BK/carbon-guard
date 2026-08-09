/**
 * Enforces root CLAUDE.md 금지 행동 ③: no ruleset (factors/regulations) change
 * may be committed without a corresponding changelog.md entry.
 */
export interface ChangelogCheckResult {
  ok: boolean;
  missing: string[];
}

/**
 * A changed file "covered" by the changelog means changelog.md's text
 * contains that file's path (relative to packages/ruleset) somewhere.
 * This is intentionally simple/text-based so it works as a fast pre-commit
 * check without needing to parse changelog structure.
 */
export function checkChangelogCoversFiles(
  changelogContent: string,
  changedFilePaths: string[]
): ChangelogCheckResult {
  const relevant = changedFilePaths.filter(
    (p) => p.startsWith("factors/") || p.startsWith("regulations/")
  );
  const missing = relevant.filter((p) => !changelogContent.includes(p));
  return { ok: missing.length === 0, missing };
}
