# 제안: GHG Protocol Corporate Standard 참고자료 (`regulations/ghg-protocol.yaml` 신규)

- 감지 계기: 사용자가 로컬 PDF `GHGP_Corporate-Standard-Korean-Translation-June-2025.pdf`
  (한국어 번역본, 2025-06)를 제공하며 활용을 요청. 1차로 3·4장(조직/운영 경계)만,
  2차로 나머지 1,2,5~9장 및 부록 A~D까지 훑어 CarbonGuard 관련성이 있는 부분을 정리함.
- 작성자: reg-watcher 역할 수행 (Claude, 세션 기준 2026-08-05)
- **반영 상태: 미반영 — 사람 검토 필요.** `regulations/`, `changelog.md`에는 아무것도
  쓰지 않았습니다 (하네스 훅 `hooks/guard-ruleset-write.mjs`이 직접 쓰기를 차단함).
  이전에 실수로 `regulations/ghg-protocol.yaml`을 직접 생성하고 `changelog.md`에
  기록했다가, 정책 위반임을 인지하고 두 파일 모두 되돌렸습니다. 아래 내용을 검토 후
  승인하시면 사람이 직접 `regulations/ghg-protocol.yaml`로 반영해 주십시오.

## 배경

이 표준(WRI/WBCSD 공동 발간, 공식: https://ghgprotocol.org/corporate-standard)은
배출계수가 아니라 산정 방법론이므로 승인 게이트 ①(배출계수·규제 룰 변경)과 정확히
같은 성격은 아니지만, `regulations/` 산하에 두어 CBAM/CCA/CSRD 룰과 함께 관리하는
것이 자연스럽다고 판단했습니다. `status: reference`처럼 draft/approved 이분법에
맞지 않는 상태값을 쓰고 싶다면 `packages/ruleset/src/schema.ts`의
`RegulationFileSchema.status` enum(`draft`|`approved`)도 함께 확장할지 사람이
결정해야 합니다 (스키마 변경은 코드 변경이라 이 훅 대상은 아니지만, 방향성 확인 필요).

## 제안 파일 전체 내용 (`packages/ruleset/regulations/ghg-protocol.yaml`)

```yaml
# GHG Protocol Corporate Accounting and Reporting Standard — 조직/운영 경계(Boundary) 및
# 산정·보고 방법론 참고 자료. CBAM/CCA/CSRD 보고서에서 요구하는 Scope 1/2/3 산정 범위,
# 기준 연도 재계산, 필수 보고 항목을 정의할 때 참조한다. 배출계수가 아니므로
# packages/ruleset/factors와는 별개이며, emission-engine의 scope 분류
# (scope1/scope2/scope3) 및 향후 조직 경계(지분 할당 vs 통제) 로직을 설계할 때 근거로 삼는다.
regulation_key: ghg-protocol-corporate-standard
jurisdiction: international # WRI/WBCSD 공동 발간, 국가 규제가 아닌 자발적 산정 방법론 표준
version: "revised edition (한국어 번역본 2025-06)"
effective_from: "2004-01-01" # GHG Protocol Corporate Standard revised edition 최초 발간일
source_url: "https://ghgprotocol.org/corporate-standard" # 공식 발간처(WRI/WBCSD)
source_note: >
  사용자가 제공한 로컬 PDF "GHGP_Corporate-Standard-Korean-Translation-June-2025.pdf"
  (한국어 번역본, 2025-06)의 1~9장 및 부록 A를 요약. 조항 번호·수치가 아닌 "정의/원칙"
  요약이므로 배출계수처럼 근거 URL 검증 대상은 아니지만, 세부 조항을 인용해야 할 경우
  원본 PDF 또는 위 공식 URL을 재확인할 것.
status: draft # 이 표준은 배출계수처럼 사람 승인 대상 룰은 아니지만, 스키마상 reference 상태를
  # 추가하지 않는 한 draft로 둔다 (사람이 검토 후 approved로 바꾸거나 스키마를 확장할지 결정).

accounting_principles: # 1장. 온실가스 산정 및 보고 5대 원칙.
  # compliance-evaluator 평가 기준(필수 필드 누락/기간 불일치/계수 출처 미기재/단위
  # 오류/False Claims 리스크 — root CLAUDE.md 참조)의 방법론적 근거.
  relevance: 적합성 — 인벤토리 경계가 사업 관계·경제적 실제를 반영해야 한다.
  completeness: 완전성 — 선택한 경계 내 모든 배출원을 산정하고, 제외 사항은 공개·소명해야 한다.
  consistency: 일관성 — 시간 경과 비교가 가능하도록 방법론을 일관 적용하고 변경사항은 투명하게 기록한다.
  transparency: 투명성 — 가정·방법론·데이터 출처를 감사 추적이 가능하도록 명확히 밝힌다.
  accuracy: 정확성 — 배출량을 구조적으로 과대·과소 추정하지 않고 불확도를 실제적으로 최소화한다.

organizational_boundary: # 3장. 조직 경계 설정
  description: >
    기업이 온실가스 배출량을 "연결"할 사업활동의 범위를 정하는 단계.
    지분 할당 접근법과 통제 접근법 중 하나를 선택해 전사적으로 일관되게 적용해야 한다.
  approaches:
    equity_share:
      name: 지분 할당 접근법
      rule: 기업은 사업활동에서 발생하는 배출량을 자사의 지분율(경제적 위험/보상 비율)만큼 산정한다.
    control:
      name: 통제 접근법
      rule: 통제권을 가진 사업활동의 배출량 100%를 산정하고, 지분이 있어도 통제권이 없으면 0%로 산정한다.
      sub_types:
        financial_control:
          name: 재무 통제
          rule: 사업활동의 재무/운영 방침을 정할 수 있는 힘(경제적 이익 획득 목적)을 가진 경우. 지분 50% 미만이어도 성립 가능.
        operational_control:
          name: 운영 통제
          rule: 기업 또는 자회사가 운영방침을 도입·실시할 전적인 권한을 가진 경우. 통상 "운영 라이선스 보유" 시설.
  double_counting_note: >
    둘 이상 기업이 같은 공동 사업활동에 서로 다른 연결 접근법을 적용하면 이중 계산이
    발생할 수 있다. 자발적 공개 보고에서는 연결 접근법을 명시하면 문제되지 않으나,
    배출권 거래제 등 의무 보고 프로그램에서는 이중 계산 방지에 유의해야 한다.

operational_boundary: # 4장. 운영 경계 설정
  description: >
    조직 경계가 정해진 사업활동에 대해, 배출을 직접/간접으로 나누고 Scope 1/2/3으로
    분류하는 단계. CarbonGuard의 emission-engine scope1/scope2/scope3 태깅과 직접 대응.
  scopes:
    scope1:
      name: 직접 온실가스 배출
      rule: 기업이 소유·통제하는 배출원(보일러/용광로/차량/공정설비 등)에서 발생하는 배출.
      exclusions:
        - 바이오매스 연소 직접 CO2 배출은 Scope 1에서 제외하고 별도 보고
        - Kyoto Protocol 미대상 가스(CFCs, NOx 등)는 Scope 1 제외, 선택적 별도 보고
      note: 자가발전 전력을 타사에 판매해도 발전으로 인한 Scope 1 배출은 상계/차감하지 않는다.
    scope2:
      name: 전력 간접 온실가스 배출
      rule: 기업이 소비하는 구매 전력(또는 무상으로 조직 경계 내로 반입된 전력)의 생산 단계에서 발생하는 배출.
      td_loss_rule: >
        송배전(T&D) 손실분 관련 배출은 송배전망을 소유·통제하는 기업(전력회사)이
        Scope 2로 보고하며, 최종 소비자는 이를 Scope 2에 포함하지 않는다
        (선택적으로 Scope 3 "송배전 손실 전력 발전" 카테고리에 보고 가능).
        → 전력구매기업은 소비단이 아닌 발전단 배출계수를 사용해야 한다.
    scope3:
      name: 기타 간접 온실가스 배출 (선택 보고)
      rule: 기업 활동의 결과이지만 다른 주체가 소유·통제하는 배출원에서 발생하는 배출.
      example_categories:
        - 구매한 자재·연료의 추출/생산
        - 구매 자재/제품/폐기물/직원 이동
        - 임차자산·외주·프랜차이즈 (선택한 연결 접근법이 적용되지 않는 경우)
        - 판매된 제품·서비스의 사용, 폐기
      selection_guidance: >
        Scope 1/2 대비 배출량 비중이 크거나, 리스크 노출에 기여하거나, 이해관계자가
        중요하다고 판단하거나, 감축 여지가 있는 카테고리를 우선 선정한다. 전과정평가(LCA)
        전체를 요구하지 않는다.
  minimum_reporting: Scope 1과 Scope 2는 반드시 각각 분리하여 산정·보고해야 한다. Scope 3은 선택.
  leased_assets:
    equity_or_financial_control: 재무회계상 완전소유자산으로 취급되는 임차자산(금융/자본리스)의 배출만 산정.
    operational_control: 임차인이 직접 운영하는 임차자산의 배출만 산정 (운영리스는 일반적으로 제외).

base_year_recalculation: # 5장. 시간 경과에 따른 배출량 추적 — DB 정정(과거 배출 기록 수정) 승인 게이트 ④와 직결
  description: >
    인수·분할매각·합병, 계산방법론/배출계수 정확도 변경, 유의미한 오류 발견 시
    기준 연도 배출량을 소급 재계산해야 시간 경과 비교의 일관성이 유지된다.
  triggers:
    - 기준 연도 배출량에 유의미한 영향을 미치는 조직 구조변화(인수/분할매각/외주화/내부화)
    - 기준 연도 데이터에 유의미한 영향을 미치는 계산방법론 변경 또는 배출계수·활동자료 정확도 개선
    - 유의미하거나 누적적으로 유의미한 오류 발견
  non_triggers:
    - 자체 성장/쇠퇴(생산량 증감, 제품 믹스 변화, 기존 사업장의 개소·폐쇄)
    - 기준 연도 설정 이후에 존재하게 된 시설의 인수(그 시설의 과거 데이터만 있는 연도까지 소급)
    - Scope 2/3로 이미 보고 중인 외주/내부화 (Scope 1↔Scope 3 간 이동이 유의미한 경우는 예외)
  significance_threshold_note: >
    표준 자체는 구체적인 "유의미성 임계치" 수치를 규정하지 않으며, 기업이 정책으로
    정해 일관되게 적용하고 공개해야 한다(예: California Climate Action Registry는 10%를 사용).
    CarbonGuard가 과거 배출 기록 수정 UI를 제공할 경우, 이 임계치 정책을 사용자가
    명시하도록 요구하고 근거를 changelog/감사로그에 남겨야 한다.

reporting_requirements: # 9장. 온실가스 배출량 보고 — packages/report-templates 산출물 체크리스트
  required:
    - 선택된 연결 접근법을 포함한 조직 경계 개요
    - 선택된 운영 경계 개요 (Scope 3 포함 시 활동 유형 목록)
    - 보고 기간
    - 온실가스 거래(구매/판매/이전)와 분리된 Scope 1·Scope 2 총배출량
    - Scope별 배출량 데이터
    - 6대 온실가스(CO2, CH4, N2O, HFCs, PFCs, SF6)별 배출량 (metric ton, CO2eq ton)
    - 기준 연도 및 재계산 정책·사유
    - 배출량 계산/측정 방법론 및 계산 툴 참조
    - 제외된 배출원·시설·사업활동
    - 외부 검증 개요(해당 시 검증서)
  optional:
    - 신뢰 가능한 Scope 3 카테고리별 데이터
    - 사업 단위/시설·국가·배출원 유형별 세분화 데이터
    - 비율 지표(생산량당 배출량 등)
    - 인벤토리 품질(불확도 원인·규모) 정보
  double_counting_note: >
    다른 시설/사업단위/기업의 인벤토리 연결에서 이미 Scope 1로 보고된 배출량을
    Scope 2 또는 Scope 3 보고에 다시 포함시키지 않도록 주의해야 한다.

appendix_a_purchased_electricity: # 부록 A. 구매 전력 간접배출 산정 — Scope 2 배출계수 선택의 핵심 근거
  efg_vs_efc:
    EFG: "발전단 배출계수 = 발전으로 인한 총 CO2 배출량 / 전력 발전량"
    EFC: "소비단 배출계수 = 발전으로 인한 총 CO2 배출량 / 전력 소비량 (= EFG × (1 + 송배전손실/전력소비량))"
    rule: >
      GHG Protocol Corporate Standard는 Scope 2 산정 시 반드시 EFG(발전단 배출계수)를
      사용하도록 요구한다. 일부 국가(예: 일본)는 규제상 전력회사가 EFC도 함께 제공할 수
      있으나, 그 경우에도 Scope 2 공식 보고는 EFG 기준이어야 한다. 한국의 GIR(온실가스
      종합정보센터) 계수가 발전단/소비단 중 어느 것인지
      packages/ruleset/factors/kr-nga/*/electricity.json 등록 시 source 필드에 명시할 것.
  own_generation_own_td: >
    보고 기업이 발전과 송배전을 모두 소유·통제하며 구매 없이 자체 생산한 전력을 자체
    송배전망으로 공급하는 경우(수직 통합), 송배전 손실 관련 배출은 이미 Scope 1에
    산정되었으므로 Scope 2로 다시 보고하지 않는다 — 이중 계산 방지.

applicability_to_carbon_guard: >
  CarbonGuard는 현재(2026-08) 단일 사업장/단일 법인 기준 Scope 1(연료)·Scope 2(전력)
  산정에 집중하고 있다(packages/emission-engine). 다수 사업장·자회사를 보유한 고객이
  등장하면 organizational_boundary(지분 할당 vs 통제) 선택 로직과, 그 선택이 어떤
  청구서/시설 데이터를 합산 대상에 포함할지를 결정하는 단계가 emission-engine 앞단
  (data-collector 또는 별도 boundary-resolver)에 필요해진다. 현재 emission-engine은
  이 구분을 하지 않으므로, 다중 법인 지원 전까지는 "단일 사업장 완전 소유" 가정을
  문서화해 두고, 지분법 적용 고객에게는 TODO로 명시해야 한다.
  추가로: (1) base_year_recalculation 정책은 향후 "과거 배출 기록 수정" 기능(승인
  게이트 ④) 설계 시 그대로 반영할 것. (2) reporting_requirements의 필수 항목은
  report-templates가 CBAM/CSRD 산출물에 최소한으로 포함해야 할 필드 체크리스트로
  사용할 것. (3) Scope 2 전력 배출계수를 ruleset/factors에 등록할 때 반드시 EFG
  (발전단) 기준인지 확인하고 source에 명시할 것 — 미확인 시 TODO로 남기고 값을
  지어내지 않는다(root CLAUDE.md 금지 행동 ①).

not_covered: > # 훑었지만 CarbonGuard 현재 스코프와 낮은 관련성으로 요약을 생략한 부분
  2장(사업 목적별 인벤토리 설계 — 일반 배경지식), 6장 배출원 규명 실무 사례,
  7장 품질관리 세부 절차(불확도 정량화 등 — 위 5대 원칙으로 충분히 대체됨),
  8장 온실가스 감축량/상쇄/크레디트 산정(CarbonGuard는 현재 배출권 거래·상쇄
  기능 없음), 부록 B(임업 등 생물학적 탄소 격리 — 한국 수출 제조업 고객과 무관),
  부록 C(온실가스 프로그램 개요 표), 부록 D(산업부문별 Scope 분류 표).
  필요 시 로컬 PDF 원문에서 추가로 발췌 가능.
```

## 참고: 함께 검토가 필요한 부수 사항

1. `packages/ruleset/src/schema.ts`의 `RegulationFileSchema.status`는 현재
   `"draft" | "approved"` 두 값만 허용합니다. 위 제안은 일단 `draft`로 넣었지만,
   "배출계수처럼 승인 대상이 아닌 순수 참고자료"라는 성격을 스키마에 반영하려면
   `"reference"` 같은 세 번째 상태값을 추가하는 별도 코드 변경(PR)이 필요합니다.
   이건 ruleset 데이터가 아니라 코드 변경이라 이 훅의 차단 대상은 아니지만,
   방향을 사람이 먼저 정해주셔야 진행할 수 있습니다.
2. `loadRegulation("ghg-protocol")`을 실제로 호출하는 코드는 아직 없습니다
   (참고자료 성격이라 승인 흐름에 프로그램적으로 얹을 필요가 없다고 판단했습니다).
   compliance-evaluator 프롬프트에 이 문서 내용(특히 5대 원칙, EFG/EFC 구분)을
   직접 반영하고 싶다면 별도 논의가 필요합니다.
