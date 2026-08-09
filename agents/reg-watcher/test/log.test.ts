import { describe, expect, it } from "vitest";
import {
  formatLogEntry,
  formatNoChangeLogEntry,
  formatSkippedUnverifiedLogEntry,
  logDatePath,
} from "../src/log.js";
import type { Source } from "../src/sources.js";

const source: Source = {
  key: "cbam",
  kind: "regulation",
  url: "https://example.test/cbam",
  description: "test",
  verified: true,
};

const fixedDate = new Date("2026-07-22T03:04:05.000Z");

describe("formatLogEntry", () => {
  it("matches the CLAUDE.md log format", () => {
    const entry = formatLogEntry(source, "내용 변경 감지", "packages/ruleset/proposals/x.md", fixedDate);
    expect(entry).toBe(
      [
        "## 2026-07-22T03:04:05.000Z",
        "- 감지 항목: cbam",
        "- 출처 URL: https://example.test/cbam",
        "- 판단 근거: 내용 변경 감지",
        "- 제안 파일: packages/ruleset/proposals/x.md",
        "",
      ].join("\n")
    );
  });
});

describe("formatNoChangeLogEntry", () => {
  it("reports no proposal file", () => {
    const entry = formatNoChangeLogEntry(source, fixedDate);
    expect(entry).toContain("변경 없음");
    expect(entry).toContain("(없음)");
  });
});

describe("formatSkippedUnverifiedLogEntry", () => {
  it("explains the source was skipped for being unverified", () => {
    const entry = formatSkippedUnverifiedLogEntry(source, fixedDate);
    expect(entry).toContain("verified: false");
  });
});

describe("logDatePath", () => {
  it("returns YYYY-MM-DD", () => {
    expect(logDatePath(fixedDate)).toBe("2026-07-22");
  });
});
