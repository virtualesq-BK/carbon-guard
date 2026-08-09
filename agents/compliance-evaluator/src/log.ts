import type { Finding } from "./schema.js";

export function formatLogEntry(
  reportId: string,
  riskScore: number,
  findings: Finding[],
  requiresHumanReview: boolean,
  now: Date = new Date()
): string {
  const summaries = findings.map((f) => `${f.category}(${f.severity}): ${f.message}`);
  const processed = requiresHumanReview ? "human_review_required" : "auto_pass";
  return [
    `## ${now.toISOString()} — report_id: ${reportId}`,
    `- risk_score: ${riskScore}`,
    `- findings: [${summaries.join("; ")}]`,
    `- 처리: ${processed}`,
    "",
  ].join("\n");
}

export function logDatePath(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}
