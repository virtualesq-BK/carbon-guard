import { describe, expect, it } from "vitest";
import { buildCbamReport } from "../src/build-cbam-report.js";
import type { EmissionRecordInput } from "../src/types.js";

const records: EmissionRecordInput[] = [
  {
    id: "rec-1",
    factor_ref: "kr-nga/2026-01/electricity",
    scope: "scope2",
    emission_value: 47.81,
    period_start: "2026-01-01",
    period_end: "2026-01-31",
  },
];

describe("buildCbamReport", () => {
  it("produces a draft cbam_xml report row", () => {
    const report = buildCbamReport({
      companyId: "company-1",
      companyName: "테스트제조",
      companyBusinessRegNumber: "123-45-67890",
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
      emissionRecords: records,
    });

    expect(report.status).toBe("draft");
    expect(report.report_type).toBe("cbam_xml");
    expect(report.generated_by).toBe("compliance-generator");
    expect(report.content.used_emission_record_ids).toEqual(["rec-1"]);
    expect(typeof report.content.xml).toBe("string");
    expect(report.content.xml as string).toContain('status="DRAFT"');
  });

  it("is deterministic for the same input", () => {
    const input = {
      companyId: "company-1",
      companyName: "테스트제조",
      companyBusinessRegNumber: "123-45-67890",
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
      emissionRecords: records,
    };
    expect(buildCbamReport(input)).toEqual(buildCbamReport(input));
  });
});
