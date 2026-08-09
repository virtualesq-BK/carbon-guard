import { checkReportStructurally } from "./structural-checks.js";
import { computeRiskScore, requiresHumanReview } from "./risk-score.js";
import type { Finding, ReportForEvaluation } from "./schema.js";

export interface EvaluationResult {
  riskScore: number;
  findings: Finding[];
  requiresHumanReview: boolean;
}

/**
 * Deterministic evaluation from structural findings alone — no LLM call, no
 * dependency on network access. Callers may merge in additional findings
 * from llm-checks.ts (semantic/False-Claims review) before this step; see
 * evaluateReportWithFindings.
 */
export function evaluateReport(report: ReportForEvaluation): EvaluationResult {
  return evaluateReportWithFindings(checkReportStructurally(report));
}

export function evaluateReportWithFindings(findings: Finding[]): EvaluationResult {
  const riskScore = computeRiskScore(findings);
  return { riskScore, findings, requiresHumanReview: requiresHumanReview(riskScore) };
}
