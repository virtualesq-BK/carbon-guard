import { describe, expect, it } from "vitest";
import { countPatterns, mergeCounts } from "../src/parse.js";

describe("countPatterns", () => {
  it("counts workflow and mistake patterns separately", () => {
    const text = [
      "- 처리: pending_review",
      "- 처리: pending_review",
      "- 처리: human_review_required",
      "unit_error(high): 합계 불일치",
    ].join("\n");

    const counts = countPatterns(text);
    const pending = counts.find((c) => c.pattern.includes("pending_review"));
    const humanReview = counts.find((c) => c.pattern.includes("risk_score 70 초과"));
    const unitError = counts.find((c) => c.pattern.includes("unit_error"));

    expect(pending?.count).toBe(2);
    expect(pending?.kind).toBe("workflow");
    expect(humanReview?.count).toBe(1);
    expect(humanReview?.kind).toBe("mistake");
    expect(unitError?.count).toBe(1);
    expect(unitError?.kind).toBe("mistake");
  });

  it("omits patterns with zero occurrences", () => {
    const counts = countPatterns("아무 패턴도 없는 텍스트");
    expect(counts).toEqual([]);
  });
});

describe("mergeCounts", () => {
  it("sums counts for the same pattern across multiple files", () => {
    const a = countPatterns("- 처리: pending_review");
    const b = countPatterns("- 처리: pending_review\n- 처리: pending_review");
    const merged = mergeCounts([a, b]);
    expect(merged).toEqual([
      { pattern: "data-collector: OCR confidence 낮음 → pending_review", kind: "workflow", count: 3 },
    ]);
  });

  it("sorts merged results by count descending", () => {
    const a = countPatterns("unit_error(high): x");
    const b = countPatterns("missing_field(high): y\nmissing_field(high): z\nmissing_field(high): w");
    const merged = mergeCounts([a, b]);
    expect(merged[0].count).toBeGreaterThanOrEqual(merged[1]?.count ?? 0);
  });
});
