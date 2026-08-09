import { describe, expect, it } from "vitest";
import { checkCbamReport, checkCcaReport } from "../src/structural-checks.js";
import type { ReportForEvaluation } from "../src/schema.js";

function makeCbamReport(xml: string, usedIds: string[] = ["rec-1"]): ReportForEvaluation {
  return {
    report_type: "cbam_xml",
    period_start: "2026-01-01",
    period_end: "2026-01-31",
    content: { xml, used_emission_record_ids: usedIds },
  };
}

const validXml = `<?xml version="1.0" encoding="UTF-8"?>
<CBAMReport xmlns="urn:carbonguard:cbam:draft" status="DRAFT">
  <Declarant>
    <Name>테스트제조</Name>
    <BusinessRegistrationNumber>123-45-67890</BusinessRegistrationNumber>
  </Declarant>
  <ReportingPeriod start="2026-01-01" end="2026-01-31"/>
  <Emissions total="47.81">
    <Emission>
      <FactorRef>kr-nga/2026-01/electricity</FactorRef>
      <Scope>scope2</Scope>
      <ValueTco2e>47.81</ValueTco2e>
      <PeriodStart>2026-01-01</PeriodStart>
      <PeriodEnd>2026-01-31</PeriodEnd>
    </Emission>
  </Emissions>
</CBAMReport>
`;

describe("checkCbamReport", () => {
  it("returns no findings for a well-formed report", () => {
    expect(checkCbamReport(makeCbamReport(validXml))).toEqual([]);
  });

  it("flags missing xml content", () => {
    const findings = checkCbamReport(makeCbamReport(""));
    expect(findings.some((f) => f.category === "missing_field")).toBe(true);
  });

  it("flags empty used_emission_record_ids", () => {
    const findings = checkCbamReport(makeCbamReport(validXml, []));
    expect(findings.some((f) => f.message.includes("used_emission_record_ids"))).toBe(true);
  });

  it("flags a TODO/placeholder FactorRef", () => {
    const badXml = validXml.replace("kr-nga/2026-01/electricity", "TODO");
    const findings = checkCbamReport(makeCbamReport(badXml));
    expect(findings.some((f) => f.category === "missing_factor_source")).toBe(true);
  });

  it("flags a mismatch between Emissions total and the sum of line items", () => {
    const badXml = validXml.replace('total="47.81"', 'total="999"');
    const findings = checkCbamReport(makeCbamReport(badXml));
    expect(findings.some((f) => f.category === "unit_error" && f.severity === "high")).toBe(true);
  });

  it("flags a period mismatch between XML and report row", () => {
    const report = makeCbamReport(validXml);
    report.period_end = "2026-02-28";
    const findings = checkCbamReport(report);
    expect(findings.some((f) => f.category === "period_mismatch")).toBe(true);
  });
});

function makeCcaReport(content: Record<string, unknown>): ReportForEvaluation {
  return {
    report_type: "cca_estimate",
    period_start: "2026-01-01",
    period_end: "2026-12-31",
    content,
  };
}

const validCca = {
  taxableMarginTons: 100,
  ratePerTonUsd: 55,
  estimatedTaxUsd: 5500,
  year: 2025,
  isSimulation: true,
  assumptionNote: "SIMULATION ONLY — ...",
};

describe("checkCcaReport", () => {
  it("returns no findings for a well-formed simulation report", () => {
    expect(checkCcaReport(makeCcaReport(validCca))).toEqual([]);
  });

  it("flags missing required fields", () => {
    const { estimatedTaxUsd, ...incomplete } = validCca;
    const findings = checkCcaReport(makeCcaReport(incomplete));
    expect(findings.some((f) => f.category === "missing_field")).toBe(true);
  });

  it("flags isSimulation !== true as a false_claims_risk", () => {
    const findings = checkCcaReport(makeCcaReport({ ...validCca, isSimulation: false }));
    expect(findings.some((f) => f.category === "false_claims_risk")).toBe(true);
  });

  it("flags a missing SIMULATION disclaimer", () => {
    const findings = checkCcaReport(makeCcaReport({ ...validCca, assumptionNote: "This is your tax." }));
    expect(findings.some((f) => f.category === "false_claims_risk")).toBe(true);
  });

  it("flags arithmetic mismatch between margin × rate and estimatedTaxUsd", () => {
    const findings = checkCcaReport(makeCcaReport({ ...validCca, estimatedTaxUsd: 1 }));
    expect(findings.some((f) => f.category === "unit_error")).toBe(true);
  });

  it("flags period_start after period_end", () => {
    const report = makeCcaReport(validCca);
    report.period_start = "2027-01-01";
    const findings = checkCcaReport(report);
    expect(findings.some((f) => f.category === "period_mismatch")).toBe(true);
  });
});
