import { describe, expect, it } from "vitest";
import { formatLogEntry, logDatePath } from "../src/log.js";
import type { Finding } from "../src/schema.js";

const fixedDate = new Date("2026-07-22T03:04:05.000Z");
const findings: Finding[] = [
  { category: "unit_error", severity: "high", message: "합계 불일치" },
];

describe("formatLogEntry", () => {
  it("matches the CLAUDE.md log format and labels auto_pass at low risk", () => {
    const entry = formatLogEntry("report-1", 20, [], false, fixedDate);
    expect(entry).toBe(
      [
        "## 2026-07-22T03:04:05.000Z — report_id: report-1",
        "- risk_score: 20",
        "- findings: []",
        "- 처리: auto_pass",
        "",
      ].join("\n")
    );
  });

  it("labels human_review_required at high risk and lists findings", () => {
    const entry = formatLogEntry("report-2", 90, findings, true, fixedDate);
    expect(entry).toContain("- 처리: human_review_required");
    expect(entry).toContain("unit_error(high): 합계 불일치");
  });
});

describe("logDatePath", () => {
  it("returns YYYY-MM-DD", () => {
    expect(logDatePath(fixedDate)).toBe("2026-07-22");
  });
});
