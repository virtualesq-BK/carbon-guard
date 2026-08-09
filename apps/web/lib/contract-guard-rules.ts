// Mirrors sop/carbon-contract-clauses-reference.md — kept in sync manually.
// This is a reference library + heuristic screener, NOT legal advice.
// See sop/carbon-contract-clauses-reference.md for the full disclaimer and sources.

export interface ClauseCategory {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
}

export const CLAUSE_LIBRARY: ClauseCategory[] = [
  {
    id: "data-provision",
    title: "1. 배출데이터 제공 의무 (Data Provision Covenant)",
    summary: "공급자가 CBAM 방법론에 따른 사업장별 내재배출 데이터를 정기적으로 제공하는 조항.",
    keyPoints: [
      "분기/연 단위, EU 집행위 Communication Template 형식으로 제공",
      "CBAM Operators Portal 직접 업로드를 이행 방식으로 명시하는 최근 추세",
      "제공 기한(예: 분기 종료 후 30일), 검증보고서 사본 첨부 의무",
    ],
  },
  {
    id: "accuracy-warranty",
    title: "2. 정확성 진술·보증 (Accuracy Warranty)",
    summary: "제공 데이터가 방법론에 따라 작성되고 중대한 오류가 없다는 보증 수준.",
    keyPoints: [
      "공급자는 '합리적 주의(reasonable endeavours)' 수준으로 완화 협상하는 경우가 많음",
      "구매자는 절대적 보증을 요구하는 경우가 많음",
      "중간 타협: '검증기관 의견서 기준 보증'",
    ],
  },
  {
    id: "disclaimer",
    title: "3. 데이터 면책 (Disclaimer)",
    summary: "기본값·추정치 사용 부분과 규정 변경에 따른 소급 재산정 책임을 한정하는 조항.",
    keyPoints: [
      "기본값·산업평균·추정치 사용 부분은 '정보 제공 목적'으로 한정, 보증 배제",
      "방법론·규정 변경으로 인한 소급 재산정 책임 배제",
      "구매자 방어: 면책 범위를 '공급자가 통제할 수 없는 규정 변경'으로만 한정",
    ],
  },
  {
    id: "confidentiality",
    title: "4. 기밀유지 (Confidentiality)",
    summary: "공정·원단위·연료믹스 등 영업비밀 노출을 막는 조항.",
    keyPoints: [
      "목적 제한 (CBAM 신고 목적으로만 사용)",
      "제3자 공개 범위를 관세당국·검증기관·집행위로 한정",
      "집계(aggregated) 형태 공개만 허용, 검증기관 경유 전달 옵션",
      "CBAM 레지스트리 제출 자체는 법정 의무이므로 예외로 명시 필요",
    ],
  },
  {
    id: "liability-cap",
    title: "5. 탄소 오차 손해배상 한도 (Liability Cap)",
    summary: "배출데이터 오류로 발생하는 손해배상 범위와 상한을 정하는 조항.",
    keyPoints: [
      "직접손해 한정: CBAM 인증서 추가 구매비용 + 과태료만, 결과적 손해 배제",
      "금액 상한: 연간 계약금액의 일정 비율 또는 오류 물량분 실비 상한",
      "기본값 차액 기준: (기본값 - 실측값) × ETS 가격으로 산식화",
      "고의·중과실 예외: 데이터 조작·고의 허위는 상한 배제",
    ],
  },
  {
    id: "cost-passthrough",
    title: "6. 탄소비용 전가·가격조정 (Carbon Cost Pass-through)",
    summary: "CBAM 인증서 비용을 가격에 반영하는 조정 산식 조항.",
    keyPoints: [
      "ETS 가격 연동 조정 산식, 원산국 탄소가격 지불분 공제 반영",
      "ETS 가격 급변 대비 조정 주기·트리거 가격 명시",
    ],
  },
  {
    id: "audit-rights",
    title: "7. 감사·검증 협조 (Audit Rights)",
    summary: "구매자/검증기관의 데이터 접근·현장 방문권과 규제당국 협조 의무.",
    keyPoints: [
      "구매자 또는 인가 검증기관의 사업장 데이터 접근·현장 방문권",
      "규제당국 질의 시 협조 의무",
    ],
  },
];

export type Severity = "high" | "medium" | "low";

export interface ToxicPattern {
  id: string;
  clauseCategoryId: string;
  label: string;
  severity: Severity;
  explanation: string;
  // Case-insensitive keyword fragments; a hit on ANY of these flags the pattern.
  keywords: string[];
}

// Heuristic, keyword-based only — deliberately conservative and transparent about
// its own limits, rather than pretending to a legal judgment it can't make.
export const TOXIC_PATTERNS: ToxicPattern[] = [
  {
    id: "unlimited-liability",
    clauseCategoryId: "liability-cap",
    label: "손해배상 상한 없음 / 무제한 책임",
    severity: "high",
    explanation:
      "배출데이터 오류에 대한 배상 책임에 상한이 없거나 '모든 손해'를 포괄하는 문구는 " +
      "공급자에게 일방적으로 불리할 수 있습니다. 직접손해 한정 + 금액 상한 조항과 대조하세요.",
    keywords: ["무제한 책임", "상한 없이", "제한 없이 배상", "unlimited liability", "without limitation", "all damages"],
  },
  {
    id: "no-cure-period",
    clauseCategoryId: "liability-cap",
    label: "시정 기회 없는 즉시 해지·제재",
    severity: "high",
    explanation:
      "배출데이터 오류나 미제출 시 시정 기회(cure period) 없이 즉시 해지·위약금이 발동되는 " +
      "조항은 공급자 방어권을 과도하게 제한할 수 있습니다.",
    keywords: ["즉시 해지", "시정 기회 없이", "without cure", "immediate termination", "사전 통지 없이 해지"],
  },
  {
    id: "one-sided-disclosure",
    clauseCategoryId: "confidentiality",
    label: "구매자의 일방적·무제한 데이터 공개권",
    severity: "medium",
    explanation:
      "공급자의 원단위 배출데이터를 구매자가 목적 제한 없이 제3자에 공개할 수 있도록 " +
      "허용하는 문구는 영업비밀 노출 위험이 있습니다. 목적 제한·집계 공개 조항과 대조하세요.",
    keywords: ["자유롭게 공개", "제한 없이 공개", "unrestricted disclosure", "at buyer's sole discretion", "구매자 임의로 제3자"],
  },
  {
    id: "no-retroactive-recalc-right",
    clauseCategoryId: "disclaimer",
    label: "규정 변경 소급 적용 시 재협상권 없음",
    severity: "medium",
    explanation:
      "CBAM처럼 계수 체계 자체가 바뀌는 경우에도 소급 재산정·재협상 권리를 공급자에게 " +
      "인정하지 않는 조항은 방법론 개정 리스크를 전부 공급자에게 전가할 수 있습니다.",
    keywords: ["소급 재산정 불가", "재협상 불가", "no right to renegotiate", "retroactive", "규정 변경에도 불구하고 그대로"],
  },
  {
    id: "unrestricted-audit",
    clauseCategoryId: "audit-rights",
    label: "사전 통지 없는 무제한 감사권",
    severity: "medium",
    explanation:
      "사전 통지·상호주의 없이 구매자가 아무 때나 사업장에 접근할 수 있도록 하는 조항은 " +
      "공급자 운영에 과도한 부담이 될 수 있습니다.",
    keywords: ["사전 통지 없이", "언제든지 무제한 접근", "without prior notice", "at any time without notice"],
  },
  {
    id: "no-cost-passthrough",
    clauseCategoryId: "cost-passthrough",
    label: "탄소비용 가격 조정 배제",
    severity: "medium",
    explanation:
      "CBAM 인증서 비용 상승분을 가격에 반영할 조정 메커니즘 자체를 배제하는 조항은 " +
      "공급자가 규제 비용 상승을 전액 떠안게 만들 수 있습니다.",
    keywords: ["가격 조정 배제", "탄소비용 조정 불가", "no price adjustment", "excludes any carbon cost adjustment"],
  },
];

export interface ClauseFlag {
  patternId: string;
  label: string;
  severity: Severity;
  explanation: string;
  matchedKeyword: string;
  clauseCategoryId: string;
}

/**
 * Keyword-based screening only — no LLM, no legal judgment. Flags known toxic-clause
 * patterns so a human (ideally a lawyer) can look closer; does not itself conclude
 * that a clause is unlawful or unenforceable.
 */
export function screenClauseText(text: string): ClauseFlag[] {
  const lower = text.toLowerCase();
  const flags: ClauseFlag[] = [];
  for (const pattern of TOXIC_PATTERNS) {
    const hit = pattern.keywords.find((k) => lower.includes(k.toLowerCase()));
    if (hit) {
      flags.push({
        patternId: pattern.id,
        label: pattern.label,
        severity: pattern.severity,
        explanation: pattern.explanation,
        matchedKeyword: hit,
        clauseCategoryId: pattern.clauseCategoryId,
      });
    }
  }
  return flags;
}
