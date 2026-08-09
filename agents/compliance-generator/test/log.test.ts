import { describe, expect, it } from "vitest";
import { formatLogEntry, logDatePath } from "../src/log.js";

const fixedDate = new Date("2026-07-22T03:04:05.000Z");

describe("formatLogEntry", () => {
  it("matches the CLAUDE.md log format", () => {
    const entry = formatLogEntry(
      "report-1",
      "cbam_xml",
      ["rec-1", "rec-2"],
      ["kr-nga/2026-01/electricity"],
      fixedDate
    );
    expect(entry).toBe(
      [
        "## 2026-07-22T03:04:05.000Z — report_id: report-1",
        "- report_type: cbam_xml",
        "- 사용된 emission_records: [rec-1, rec-2]",
        "- 사용된 ruleset 버전: kr-nga/2026-01/electricity",
        "",
      ].join("\n")
    );
  });
});

describe("logDatePath", () => {
  it("returns YYYY-MM-DD", () => {
    expect(logDatePath(fixedDate)).toBe("2026-07-22");
  });
});
