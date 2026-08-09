import { simulateCcaTax } from "report-templates";
import type { ReportInsert } from "./types.js";

export interface BuildCcaReportInput {
  companyId: string;
  periodStart: string;
  periodEnd: string;
  year: number;
  carbonIntensityMarginTons: number;
}

/**
 * Builds a draft cca_estimate report row from the CCA tax simulator. The
 * simulator's own output already carries an "isSimulation"/disclaimer flag —
 * this function passes it through unchanged rather than re-deriving numbers.
 */
export function buildCcaReport(input: BuildCcaReportInput): ReportInsert {
  const simulation = simulateCcaTax({
    carbonIntensityMarginTons: input.carbonIntensityMarginTons,
    year: input.year,
  });

  return {
    company_id: input.companyId,
    report_type: "cca_estimate",
    period_start: input.periodStart,
    period_end: input.periodEnd,
    generated_by: "compliance-generator",
    content: { ...simulation },
    status: "draft",
  };
}
