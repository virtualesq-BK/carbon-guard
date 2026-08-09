import { describe, expect, it } from "vitest";
import { computeRiskScore, requiresHumanReview, RISK_SCORE_THRESHOLD } from "../src/risk-score.js";
import type { Finding } from "../src/schema.js";

describe("computeRiskScore", () => {
  it("returns 0 for no findings", () => {
    expect(computeRiskScore([])).toBe(0);
  });

  it("sums severity weights", () => {
    const findings: Finding[] = [
      { category: "unit_error", severity: "low", message: "a" },
      { category: "unit_error", severity: "medium", message: "b" },
    ];
    expect(computeRiskScore(findings)).toBe(35);
  });

  it("caps at 100", () => {
    const findings: Finding[] = Array.from({ length: 5 }, () => ({
      category: "unit_error" as const,
      severity: "high" as const,
      message: "x",
    }));
    expect(computeRiskScore(findings)).toBe(100);
  });
});

describe("requiresHumanReview", () => {
  it("is false at exactly the threshold", () => {
    expect(requiresHumanReview(RISK_SCORE_THRESHOLD)).toBe(false);
  });

  it("is true just above the threshold", () => {
    expect(requiresHumanReview(RISK_SCORE_THRESHOLD + 1)).toBe(true);
  });
});
