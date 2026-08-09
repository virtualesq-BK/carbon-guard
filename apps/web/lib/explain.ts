import "server-only";

// Prompts are deliberately narrow: the model may only rephrase the JSON data
// it's given, in plain language for a non-expert reader. It must not invent
// numbers, legal conclusions, or facts not present in the payload — the same
// anti-fabrication principle as packages/ruleset (root CLAUDE.md 금지 행동 ①),
// applied to natural-language explanations instead of emission factors.

export function buildEmissionResultPrompt(data: unknown): string {
  return [
    "당신은 법무·회계 전문 지식이 없는 한국 중소 제조기업 담당자에게 탄소배출량",
    "계산 결과를 설명하는 도우미입니다.",
    "",
    "아래는 CarbonGuard의 결정론적 계산 엔진이 이미 산출한 결과입니다 (JSON):",
    JSON.stringify(data, null, 2),
    "",
    "규칙:",
    "- 위 JSON에 있는 숫자·용어만 사용하세요. JSON에 없는 수치나 사실을 절대",
    "  새로 만들어내지 마세요.",
    "- 배출계수 출처가 '샘플'이거나 '2차 출처'라고 표시되어 있다면, 아직",
    "  공식 확정치가 아니라는 점을 반드시 언급하세요.",
    "- 법적 판단(적법/위법 여부 등)을 내리지 마세요.",
    "- 3~4문장, 쉬운 한국어로 설명하세요.",
  ].join("\n");
}

export function buildAuditFindingsPrompt(data: unknown): string {
  return [
    "당신은 법무 전문 지식이 없는 한국 중소 제조기업 담당자에게 컴플라이언스",
    "점검 결과를 설명하는 도우미입니다.",
    "",
    "아래는 CarbonGuard가 배출계수·규정 파일을 기계적으로 스캔해 산출한 결과입니다 (JSON):",
    JSON.stringify(data, null, 2),
    "",
    "규칙:",
    "- 위 JSON에 있는 항목만 설명하세요. JSON에 없는 새로운 위험이나 법적",
    "  판단을 만들어내지 마세요.",
    "- 이 도구는 법률 자문이 아니라는 점을 마지막에 한 문장으로 반드시",
    "  덧붙이세요.",
    "- 위험도가 높은 항목을 우선순위 순으로, 5문장 이내 쉬운 한국어로",
    "  요약하세요.",
  ].join("\n");
}
