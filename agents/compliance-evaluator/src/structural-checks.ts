import type { Finding, ReportForEvaluation } from "./schema.js";

interface ParsedCbamXml {
  total: number;
  reportingPeriod: { start: string; end: string } | null;
  lines: { factorRef: string; scope: string; valueTco2e: number }[];
}

function parseCbamXml(xml: string): ParsedCbamXml {
  const totalMatch = xml.match(/<Emissions total="([\d.]+)">/);
  const periodMatch = xml.match(/<ReportingPeriod start="([^"]+)" end="([^"]+)"/);
  const lineRegex =
    /<Emission>\s*<FactorRef>([^<]*)<\/FactorRef>\s*<Scope>([^<]*)<\/Scope>\s*<ValueTco2e>([^<]*)<\/ValueTco2e>/g;

  const lines: ParsedCbamXml["lines"] = [];
  let match: RegExpExecArray | null;
  while ((match = lineRegex.exec(xml))) {
    lines.push({ factorRef: match[1], scope: match[2], valueTco2e: Number(match[3]) });
  }

  return {
    total: totalMatch ? Number(totalMatch[1]) : NaN,
    reportingPeriod: periodMatch ? { start: periodMatch[1], end: periodMatch[2] } : null,
    lines,
  };
}

/**
 * Deterministic (LLM-free) structural checks for a cbam_xml report: missing
 * fields, period mismatch, missing/placeholder factor references, and
 * arithmetic (unit-level) errors. Designed to catch generator bugs, not to
 * replace human legal review.
 */
export function checkCbamReport(report: ReportForEvaluation): Finding[] {
  const findings: Finding[] = [];
  const xml = typeof report.content.xml === "string" ? report.content.xml : "";
  const usedIds = Array.isArray(report.content.used_emission_record_ids)
    ? (report.content.used_emission_record_ids as unknown[])
    : [];

  if (!xml) {
    findings.push({ category: "missing_field", severity: "high", message: "content.xml이 비어 있습니다." });
    return findings;
  }

  if (usedIds.length === 0) {
    findings.push({
      category: "missing_field",
      severity: "high",
      message: "사용된 emission_records가 없습니다 (used_emission_record_ids가 비어 있음).",
    });
  }

  const parsed = parseCbamXml(xml);

  if (parsed.lines.length === 0) {
    findings.push({
      category: "missing_field",
      severity: "high",
      message: "XML 안에 Emission 라인이 하나도 없습니다.",
    });
  }

  for (const line of parsed.lines) {
    if (!line.factorRef.trim() || /todo/i.test(line.factorRef)) {
      findings.push({
        category: "missing_factor_source",
        severity: "high",
        message: `FactorRef가 비어있거나 미확정 상태입니다: "${line.factorRef}"`,
      });
    }
    if (!Number.isFinite(line.valueTco2e) || line.valueTco2e < 0) {
      findings.push({
        category: "unit_error",
        severity: "medium",
        message: `ValueTco2e 값이 유효하지 않습니다: ${line.valueTco2e}`,
      });
    }
  }

  const sum = parsed.lines.reduce(
    (acc, l) => acc + (Number.isFinite(l.valueTco2e) ? l.valueTco2e : 0),
    0
  );
  if (Number.isFinite(parsed.total) && Math.abs(sum - parsed.total) > 0.001) {
    findings.push({
      category: "unit_error",
      severity: "high",
      message: `Emissions total(${parsed.total})이 개별 항목 합계(${sum})와 일치하지 않습니다.`,
    });
  }

  if (
    parsed.reportingPeriod &&
    (parsed.reportingPeriod.start !== report.period_start ||
      parsed.reportingPeriod.end !== report.period_end)
  ) {
    findings.push({
      category: "period_mismatch",
      severity: "medium",
      message:
        `XML의 ReportingPeriod(${parsed.reportingPeriod.start}~${parsed.reportingPeriod.end})가 ` +
        `report.period_start/end(${report.period_start}~${report.period_end})와 다릅니다.`,
    });
  }

  return findings;
}

/**
 * Deterministic structural checks for a cca_estimate report: required fields,
 * the simulation disclaimer (must never look like a confirmed tax figure),
 * and the tax = margin × rate arithmetic.
 */
export function checkCcaReport(report: ReportForEvaluation): Finding[] {
  const findings: Finding[] = [];
  const c = report.content;
  const requiredFields = [
    "taxableMarginTons",
    "ratePerTonUsd",
    "estimatedTaxUsd",
    "year",
    "isSimulation",
    "assumptionNote",
  ];

  for (const field of requiredFields) {
    if (!(field in c)) {
      findings.push({ category: "missing_field", severity: "high", message: `필수 필드 누락: ${field}` });
    }
  }
  if (findings.length > 0) return findings;

  if (c.isSimulation !== true) {
    findings.push({
      category: "false_claims_risk",
      severity: "high",
      message: "isSimulation이 true가 아닙니다 — 미확정 시뮬레이션을 확정치처럼 제시할 위험이 있습니다.",
    });
  }

  if (typeof c.assumptionNote !== "string" || !c.assumptionNote.includes("SIMULATION")) {
    findings.push({
      category: "false_claims_risk",
      severity: "high",
      message: "assumptionNote에 SIMULATION 고지 문구가 없습니다.",
    });
  }

  const margin = Number(c.taxableMarginTons);
  const rate = Number(c.ratePerTonUsd);
  const tax = Number(c.estimatedTaxUsd);
  const expected = margin * rate;
  if (
    Number.isFinite(margin) &&
    Number.isFinite(rate) &&
    Number.isFinite(tax) &&
    Math.abs(expected - tax) > 0.01
  ) {
    findings.push({
      category: "unit_error",
      severity: "high",
      message: `estimatedTaxUsd(${tax})가 taxableMarginTons × ratePerTonUsd(${expected})와 일치하지 않습니다.`,
    });
  }

  if (report.period_start > report.period_end) {
    findings.push({
      category: "period_mismatch",
      severity: "medium",
      message: "period_start가 period_end보다 늦습니다.",
    });
  }

  return findings;
}

export function checkReportStructurally(report: ReportForEvaluation): Finding[] {
  switch (report.report_type) {
    case "cbam_xml":
      return checkCbamReport(report);
    case "cca_estimate":
      return checkCcaReport(report);
    default:
      return [
        {
          category: "missing_field",
          severity: "medium",
          message: `report_type "${report.report_type}"에 대한 구조적 검증기가 아직 없습니다 — 사람 검토 필요.`,
        },
      ];
  }
}
