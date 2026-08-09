import type { PatternCount } from "./parse.js";

export interface ReviewReportInput {
  periodLabel: string; // e.g. "2026-06-22 ~ 2026-07-22"
  counts: PatternCount[];
  topN?: number;
}

/**
 * Renders the 30-day retro as markdown: top-N repeated workflow patterns as
 * Skill candidates, top-N mistake patterns as CLAUDE.md Rule candidates.
 * This is a DRAFT ONLY — nothing here edits skills/ or CLAUDE.md automatically.
 */
export function buildReviewReport(input: ReviewReportInput): string {
  const n = input.topN ?? 3;
  const workflow = input.counts.filter((c) => c.kind === "workflow").slice(0, n);
  const mistake = input.counts.filter((c) => c.kind === "mistake").slice(0, n);

  const lines: string[] = [];
  lines.push(`# 하네스 회고 (${input.periodLabel})`);
  lines.push("");
  lines.push(
    "이 문서는 자동 생성된 **초안**입니다. skills/ 또는 root CLAUDE.md에 실제로 " +
      "반영하려면 사람이 내용을 읽고 판단해야 합니다 — 자동 반영되지 않습니다."
  );
  lines.push("");

  lines.push(`## 반복 패턴 상위 ${n}개 → Skill 후보`);
  lines.push("");
  if (workflow.length === 0) {
    lines.push("- 해당 기간에 반복된 워크플로 패턴이 없습니다.");
  } else {
    for (const w of workflow) {
      lines.push(`- **${w.pattern}** — ${w.count}회`);
    }
  }
  lines.push("");

  lines.push(`## 실수 패턴 상위 ${n}개 → CLAUDE.md Rule 후보`);
  lines.push("");
  if (mistake.length === 0) {
    lines.push("- 해당 기간에 반복된 실수 패턴이 없습니다.");
  } else {
    for (const m of mistake) {
      lines.push(`- **${m.pattern}** — ${m.count}회`);
    }
  }
  lines.push("");

  return lines.join("\n");
}
