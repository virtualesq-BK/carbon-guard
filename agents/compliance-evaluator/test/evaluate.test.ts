import { describe, expect, it } from "vitest";
import { evaluateReport } from "../src/evaluate.js";
import { RISK_SCORE_THRESHOLD } from "../src/risk-score.js";
import type { ReportForEvaluation } from "../src/schema.js";

const cleanCbam: ReportForEvaluation = {
  report_type: "cbam_xml",
  period_start: "2026-01-01",
  period_end: "2026-01-31",
  content: {
    xml: `<CBAMReport status="DRAFT"><ReportingPeriod start="2026-01-01" end="2026-01-31"/><Emissions total="10"><Emission><FactorRef>kr-nga/2026-01/electricity</FactorRef><Scope>scope2</Scope><ValueTco2e>10</ValueTco2e></Emission></Emissions></CBAMReport>`,
    used_emission_record_ids: ["rec-1"],
  },
};

describe("evaluateReport", () => {
  it("returns risk_score 0 and requiresHumanReview false for a clean report", () => {
    const result = evaluateReport(cleanCbam);
    expect(result.riskScore).toBe(0);
    expect(result.requiresHumanReview).toBe(false);
    expect(result.findings).toEqual([]);
  });

  it("flags a report with multiple structural problems as requiring human review", () => {
    const broken: ReportForEvaluation = {
      ...cleanCbam,
      content: {
        xml: `<CBAMReport status="DRAFT"><ReportingPeriod start="2026-02-01" end="2026-02-28"/><Emissions total="999"><Emission><FactorRef>TODO</FactorRef><Scope>scope2</Scope><ValueTco2e>10</ValueTco2e></Emission></Emissions></CBAMReport>`,
        used_emission_record_ids: [],
      },
    };
    const result = evaluateReport(broken);
    expect(result.riskScore).toBeGreaterThan(RISK_SCORE_THRESHOLD);
    expect(result.requiresHumanReview).toBe(true);
  });
});
