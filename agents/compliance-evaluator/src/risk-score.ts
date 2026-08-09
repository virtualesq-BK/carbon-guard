import type { Finding } from "./schema.js";

export const SEVERITY_WEIGHT = { low: 10, medium: 25, high: 50 } as const;

// root CLAUDE.md 승인 게이트 ⑦: risk_score가 70을 초과하면 발행 전 사람 재검토 필수.
export const RISK_SCORE_THRESHOLD = 70;

export function computeRiskScore(findings: Finding[]): number {
  const raw = findings.reduce((sum, f) => sum + SEVERITY_WEIGHT[f.severity], 0);
  return Math.min(100, raw);
}

export function requiresHumanReview(riskScore: number): boolean {
  return riskScore > RISK_SCORE_THRESHOLD;
}
