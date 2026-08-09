import { buildCbamXml } from "report-templates";
import type { EmissionRecordInput, ReportInsert } from "./types.js";

export interface BuildCbamReportInput {
  companyId: string;
  companyName: string;
  companyBusinessRegNumber: string;
  periodStart: string;
  periodEnd: string;
  emissionRecords: EmissionRecordInput[];
}

/**
 * Builds a draft cbam_xml report row. Every number comes from already-computed
 * emission_records (emission-engine output) — this function never calculates
 * or invents an emission value itself.
 */
export function buildCbamReport(input: BuildCbamReportInput): ReportInsert {
  const xml = buildCbamXml({
    companyName: input.companyName,
    companyBusinessRegNumber: input.companyBusinessRegNumber,
    reportingPeriodStart: input.periodStart,
    reportingPeriodEnd: input.periodEnd,
    emissionRecords: input.emissionRecords.map((r) => ({
      factorRef: r.factor_ref,
      scope: r.scope,
      emissionValueTco2e: r.emission_value,
      periodStart: r.period_start,
      periodEnd: r.period_end,
    })),
  });

  return {
    company_id: input.companyId,
    report_type: "cbam_xml",
    period_start: input.periodStart,
    period_end: input.periodEnd,
    generated_by: "compliance-generator",
    content: {
      xml,
      used_emission_record_ids: input.emissionRecords.map((r) => r.id),
    },
    status: "draft",
  };
}
