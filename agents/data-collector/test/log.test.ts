import { describe, expect, it } from "vitest";
import { formatLogEntry, logDatePath } from "../src/log.js";
import type { BillExtraction } from "../src/schema.js";

const extraction: BillExtraction = {
  bill_type: "electricity",
  billing_period_start: "2026-01-01",
  billing_period_end: "2026-01-31",
  extracted_quantity: 1000,
  extracted_unit: "kWh",
  confidence: 0.92,
};

const fixedDate = new Date("2026-07-22T03:04:05.000Z");

describe("formatLogEntry", () => {
  it("matches the CLAUDE.md log format for an auto-confirmed bill", () => {
    const entry = formatLogEntry("bill-1", extraction, "confirmed", fixedDate);
    expect(entry).toBe(
      [
        "## 2026-07-22T03:04:05.000Z — utility_bill_id: bill-1",
        "- confidence: 0.92",
        "- 추출값: 1000 kWh",
        "- 처리: auto_confirmed",
        "",
      ].join("\n")
    );
  });

  it("labels a low-confidence bill as pending_review", () => {
    const entry = formatLogEntry("bill-2", { ...extraction, confidence: 0.4 }, "pending_review", fixedDate);
    expect(entry).toContain("- 처리: pending_review");
  });
});

describe("logDatePath", () => {
  it("returns YYYY-MM-DD", () => {
    expect(logDatePath(fixedDate)).toBe("2026-07-22");
  });
});
