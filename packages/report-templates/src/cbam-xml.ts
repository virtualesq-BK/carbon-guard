import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다");

export const CbamEmissionLineSchema = z.object({
  factorRef: z.string().min(1), // e.g. "kr-nga/2026-01/electricity"
  scope: z.enum(["scope1", "scope2", "scope3"]),
  emissionValueTco2e: z.number().nonnegative(),
  periodStart: isoDate,
  periodEnd: isoDate,
});

export const CbamXmlInputSchema = z.object({
  companyName: z.string().min(1),
  companyBusinessRegNumber: z.string().min(1),
  reportingPeriodStart: isoDate,
  reportingPeriodEnd: isoDate,
  emissionRecords: z.array(CbamEmissionLineSchema),
});

export type CbamXmlInput = z.infer<typeof CbamXmlInputSchema>;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Builds a draft CBAM XML report. Purely deterministic string formatting —
 * every number comes from emission-engine-computed emission records, never
 * generated here. Always emitted with status="DRAFT"; only a human approval
 * (root CLAUDE.md 승인 게이트 ②) can turn this into a submission.
 */
export function buildCbamXml(rawInput: CbamXmlInput): string {
  const input = CbamXmlInputSchema.parse(rawInput);

  const totalEmissions = input.emissionRecords.reduce(
    (sum, r) => sum + r.emissionValueTco2e,
    0
  );

  const items = input.emissionRecords
    .map(
      (r) => `    <Emission>
      <FactorRef>${escapeXml(r.factorRef)}</FactorRef>
      <Scope>${escapeXml(r.scope)}</Scope>
      <ValueTco2e>${r.emissionValueTco2e}</ValueTco2e>
      <PeriodStart>${r.periodStart}</PeriodStart>
      <PeriodEnd>${r.periodEnd}</PeriodEnd>
    </Emission>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<CBAMReport xmlns="urn:carbonguard:cbam:draft" status="DRAFT">
  <Declarant>
    <Name>${escapeXml(input.companyName)}</Name>
    <BusinessRegistrationNumber>${escapeXml(input.companyBusinessRegNumber)}</BusinessRegistrationNumber>
  </Declarant>
  <ReportingPeriod start="${input.reportingPeriodStart}" end="${input.reportingPeriodEnd}"/>
  <Emissions total="${totalEmissions}">
${items}
  </Emissions>
</CBAMReport>
`;
}
