import type { Source } from "./sources.js";

export interface ProposalContext {
  source: Source;
  previousHash: string | null;
  newHash: string;
  fetchedAt: Date;
}

/**
 * Builds a proposal markdown file — NEVER writes directly to
 * packages/ruleset/factors or regulations. A human reads this file, verifies
 * the source themselves, and only then edits the ruleset + changelog.md by
 * hand (root CLAUDE.md 승인 게이트 ①, 자동 병합 절대 금지).
 */
export function buildProposalMarkdown(ctx: ProposalContext): string {
  const { source, previousHash, newHash, fetchedAt } = ctx;
  const changeKind = previousHash === null ? "최초 조회" : "내용 변경 감지";

  return `# 규제/계수 업데이트 제안 — ${source.key}

- 상태: **제안 (사람 검토 필요, 자동 반영 아님)**
- 종류: ${source.kind === "factor" ? "배출계수" : "규제 룰"}
- 대상 key: \`${source.key}\`
- 출처 URL: ${source.url}
- 출처 설명: ${source.description}
- 조회 시각: ${fetchedAt.toISOString()}
- 판단 근거: ${changeKind} (이전 해시: ${previousHash ?? "(없음)"}, 새 해시: ${newHash})

## 다음 단계 (사람이 수행)

1. 위 출처 URL을 직접 열어 실제 변경 내용을 확인한다.
2. 변경이 실제 배출계수/규제 수치에 영향을 준다면
   ${
     source.kind === "factor"
       ? "`packages/ruleset/factors/`"
       : "`packages/ruleset/regulations/`"
   } 아래 해당 파일을 사람이 직접 수정한다.
3. \`packages/ruleset/changelog.md\`에 근거 URL과 함께 변경 이력을 남긴다.
4. 이 제안 파일은 반영 후 삭제하거나 보관용으로 옮긴다.

reg-watcher는 이 파일을 생성하는 것 이상의 어떤 쓰기도 ruleset에 수행하지 않는다.
`;
}

export function proposalFileName(source: Source, fetchedAt: Date): string {
  const datePart = fetchedAt.toISOString().slice(0, 10);
  const safeKey = source.key.replace(/\//g, "_");
  return `${datePart}-${safeKey}.md`;
}
