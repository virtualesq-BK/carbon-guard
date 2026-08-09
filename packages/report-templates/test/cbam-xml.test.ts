import { describe, expect, it } from "vitest";
import { buildCbamXml, type CbamXmlInput } from "../src/cbam-xml.js";

const baseInput: CbamXmlInput = {
  companyName: "테스트제조 & Co.",
  companyBusinessRegNumber: "123-45-67890",
  reportingPeriodStart: "2026-01-01",
  reportingPeriodEnd: "2026-03-31",
  emissionRecords: [
    {
      factorRef: "kr-nga/2026-01/electricity",
      scope: "scope2",
      emissionValueTco2e: 47.81,
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
    },
    {
      factorRef: "kr-nga/2026-01/electricity",
      scope: "scope2",
      emissionValueTco2e: 50.2,
      periodStart: "2026-02-01",
      periodEnd: "2026-02-28",
    },
  ],
};

describe("buildCbamXml", () => {
  it("always emits status=DRAFT", () => {
    const xml = buildCbamXml(baseInput);
    expect(xml).toContain('status="DRAFT"');
  });

  it("sums emissionValueTco2e into the Emissions total attribute", () => {
    const xml = buildCbamXml(baseInput);
    expect(xml).toContain('total="98.01"');
  });

  it("emits one Emission element per record", () => {
    const xml = buildCbamXml(baseInput);
    expect(xml.match(/<Emission>/g)).toHaveLength(2);
  });

  it("escapes XML-unsafe characters in company name", () => {
    const xml = buildCbamXml(baseInput);
    expect(xml).toContain("테스트제조 &amp; Co.");
    expect(xml).not.toContain("테스트제조 & Co.");
  });

  it("throws on invalid input (bad date format)", () => {
    expect(() =>
      buildCbamXml({ ...baseInput, reportingPeriodStart: "2026/01/01" })
    ).toThrow();
  });

  it("produces an empty Emissions block with total 0 when there are no records", () => {
    const xml = buildCbamXml({ ...baseInput, emissionRecords: [] });
    expect(xml).toContain('total="0"');
  });
});
