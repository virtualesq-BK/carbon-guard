import { describe, expect, it } from "vitest";
import { buildReviewReport } from "../src/report.js";
import type { PatternCount } from "../src/parse.js";

const counts: PatternCount[] = [
  { pattern: "workflow A", kind: "workflow", count: 5 },
  { pattern: "workflow B", kind: "workflow", count: 3 },
  { pattern: "mistake A", kind: "mistake", count: 4 },
];

describe("buildReviewReport", () => {
  it("separates workflow (Skill candidates) from mistake (Rule candidates) sections", () => {
    const report = buildReviewReport({ periodLabel: "2026-06-22 ~ 2026-07-22", counts });
    expect(report).toContain("Skill 후보");
    expect(report).toContain("Rule 후보");
    expect(report).toContain("workflow A");
    expect(report).toContain("mistake A");
  });

  it("always states this is a draft that requires human review", () => {
    const report = buildReviewReport({ periodLabel: "x", counts: [] });
    expect(report).toContain("초안");
    expect(report).toContain("자동 반영되지 않습니다");
  });

  it("shows a placeholder when there are no patterns of a kind", () => {
    const report = buildReviewReport({ periodLabel: "x", counts: [] });
    expect(report).toContain("반복된 워크플로 패턴이 없습니다");
    expect(report).toContain("반복된 실수 패턴이 없습니다");
  });

  it("respects the topN limit", () => {
    const many: PatternCount[] = Array.from({ length: 5 }, (_, i) => ({
      pattern: `workflow ${i}`,
      kind: "workflow" as const,
      count: 5 - i,
    }));
    const report = buildReviewReport({ periodLabel: "x", counts: many, topN: 2 });
    expect(report).toContain("workflow 0");
    expect(report).toContain("workflow 1");
    expect(report).not.toContain("workflow 2");
  });
});
