import { describe, expect, it } from "vitest";
import { buildCcaReport } from "../src/build-cca-report.js";

describe("buildCcaReport", () => {
  it("produces a draft cca_estimate report row carrying the simulation flag", () => {
    const report = buildCcaReport({
      companyId: "company-1",
      periodStart: "2026-01-01",
      periodEnd: "2026-12-31",
      year: 2026,
      carbonIntensityMarginTons: 200,
    });

    expect(report.status).toBe("draft");
    expect(report.report_type).toBe("cca_estimate");
    expect(report.content.isSimulation).toBe(true);
    expect(report.content.estimatedTaxUsd).toBeCloseTo(200 * 55 * 1.025, 6);
    expect(report.content.assumptionNote).toMatch(/SIMULATION ONLY/);
  });
});
