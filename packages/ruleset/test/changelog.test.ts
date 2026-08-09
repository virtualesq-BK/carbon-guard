import { describe, expect, it } from "vitest";
import { checkChangelogCoversFiles } from "../src/changelog.js";

describe("checkChangelogCoversFiles", () => {
  const changelog = `# Changelog\n\n## 2026-07-22 — factors/kr-nga/2026-01/electricity.json\n- placeholder created\n`;

  it("passes when every ruleset file path appears in the changelog", () => {
    const result = checkChangelogCoversFiles(changelog, [
      "factors/kr-nga/2026-01/electricity.json",
    ]);
    expect(result).toEqual({ ok: true, missing: [] });
  });

  it("flags ruleset files missing a changelog mention", () => {
    const result = checkChangelogCoversFiles(changelog, [
      "regulations/cbam.yaml",
    ]);
    expect(result.ok).toBe(false);
    expect(result.missing).toEqual(["regulations/cbam.yaml"]);
  });

  it("ignores non-ruleset files (e.g. src/*.ts changes)", () => {
    const result = checkChangelogCoversFiles(changelog, ["src/index.ts"]);
    expect(result).toEqual({ ok: true, missing: [] });
  });
});
