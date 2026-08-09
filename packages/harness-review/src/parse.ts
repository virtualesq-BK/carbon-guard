export type PatternKind = "workflow" | "mistake";

export interface PatternDefinition {
  pattern: string;
  regex: RegExp;
  kind: PatternKind;
}

// "workflow" = a repeated human/agent workflow step → 3+ occurrences suggests
// promoting it to a skills/*/SKILL.md. "mistake" = something an evaluator or
// human had to catch/correct → 3+ occurrences suggests a root CLAUDE.md rule.
export const PATTERN_DEFINITIONS: PatternDefinition[] = [
  {
    pattern: "data-collector: OCR confidence 낮음 → pending_review",
    regex: /- 처리: pending_review/g,
    kind: "workflow",
  },
  {
    pattern: "reg-watcher: 원문 변경 감지 → 제안 파일 생성",
    regex: /판단 근거: (내용 해시 변경 감지|최초 조회)/g,
    kind: "workflow",
  },
  {
    pattern: "compliance-evaluator: risk_score 70 초과 → 사람 재검토 필요",
    regex: /- 처리: human_review_required/g,
    kind: "mistake",
  },
  {
    pattern: "compliance-evaluator finding: unit_error (계산/단위 오류)",
    regex: /unit_error\(/g,
    kind: "mistake",
  },
  {
    pattern: "compliance-evaluator finding: missing_factor_source (계수 출처 미기재)",
    regex: /missing_factor_source\(/g,
    kind: "mistake",
  },
  {
    pattern: "compliance-evaluator finding: missing_field (필수 필드 누락)",
    regex: /missing_field\(/g,
    kind: "mistake",
  },
  {
    pattern: "compliance-evaluator finding: period_mismatch (기간 불일치)",
    regex: /period_mismatch\(/g,
    kind: "mistake",
  },
  {
    pattern: "compliance-evaluator finding: false_claims_risk (과장/오해 소지 서술)",
    regex: /false_claims_risk\(/g,
    kind: "mistake",
  },
];

export interface PatternCount {
  pattern: string;
  kind: PatternKind;
  count: number;
}

/** Counts each defined pattern's occurrences in one log file's text. Pure — no fs. */
export function countPatterns(logText: string): PatternCount[] {
  return PATTERN_DEFINITIONS.map(({ pattern, regex, kind }) => ({
    pattern,
    kind,
    count: (logText.match(regex) ?? []).length,
  })).filter((p) => p.count > 0);
}

/** Merges per-file counts (e.g. across 30 days of logs) into repo-wide totals. */
export function mergeCounts(all: PatternCount[][]): PatternCount[] {
  const totals = new Map<string, PatternCount>();
  for (const list of all) {
    for (const item of list) {
      const existing = totals.get(item.pattern);
      if (existing) {
        existing.count += item.count;
      } else {
        totals.set(item.pattern, { ...item });
      }
    }
  }
  return Array.from(totals.values()).sort((a, b) => b.count - a.count);
}
