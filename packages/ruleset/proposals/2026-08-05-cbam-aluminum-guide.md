# 제안: CBAM 알루미늄 부문 산정 가이드 (`regulations/cbam.yaml` 보강 + 신규 참고자료)

- 감지 계기: 사용자가 로컬 PDF `유럽연합 탄소국경조정제도(CBAM) 알루미늄편 해설서.pdf`
  (한국환경공단/한국생산기술연구원 계열 국문 해설서로 추정, 발간일 2024-02-22 초안)를
  제공하며 활용을 요청.
- 작성자: reg-watcher 역할 수행 (Claude, 세션 기준 2026-08-05)
- **반영 상태: 미반영 — 사람 검토 필요.** `regulations/`, `changelog.md`에는 아무것도
  쓰지 않았습니다 (하네스 훅이 차단; [[2026-08-05-ghg-protocol-corporate-standard-reference]]
  건에서 학습한 대로 처음부터 proposals/에만 작성했습니다).

## 원문 추출 관련 주의사항

`pdftotext`로 추출 시 제목/도식 텍스트 상당수가 `Adobe-Korea1` CID 폰트 매핑 오류로
깨져서 나왔습니다 (`Syntax Error: Unknown character collection 'Adobe-Korea1'`).
본문 단락은 대체로 정상 추출되었으나, **표·그림 내부의 수치·단위는 이번 발췌에서
검증하지 못했습니다.** 아래 내용 중 CN 코드 목록과 기본값 텍스트는 본문 문장에서
직접 인용한 것이며, 표/그림 형태로만 존재하는 상세 배출계수 수치(있다면)는
포함하지 않았습니다 — root CLAUDE.md 금지 행동 ①에 따라 확인 안 된 수치는
지어내지 않았습니다.

## 1. `regulations/cbam.yaml`에 반영 제안 — 알루미늄 CN 코드 (Annex I 기준)

현재 `cbam.yaml`의 `covered_sectors`에는 `aluminium`이 문자열로만 있고 CN 코드가
없습니다. 해설서 [표 1]에서 인용한 CN 코드 목록을 추가할 것을 제안합니다.

```yaml
covered_sectors:
  - key: aluminium
    cn_codes:
      - "7601"
      - "7603"
      - "7604"
      - "7605"
      - "7606"
      - "7607"
      - "7608"
      - "76090000"
      - "7610"
      - "76110000"
      - "7612"
      - "76130000"
      - "7614"
      - "7616"
    exemptions: "150유로 이하 소형품목(샘플 등), 군사용 물품"
    source: "해설서 [표 1] EU CBAM 적용 대상 품목 (원문: CBAM Regulation (EU) 2023/956 Annex I)"
```

**사람 검토 필요 사항**: 이 CN 코드 목록은 국문 해설서에서 재인용한 것이며, EUR-Lex
원문(Annex I)과 1:1 대조는 하지 않았습니다. 법적 구속력이 있는 리스트이므로 실제
`cbam.yaml`에 반영하기 전에 EUR-Lex CELEX:32023R0956 Annex I 원문과 대조를
권장합니다. 다른 부문(철강/시멘트/비료/전력/수소) CN 코드도 같은 표에 있었으나
이번 요청 범위(알루미늄)를 벗어나 발췌하지 않았습니다.

**✅ 2026-08-05 EUR-Lex 원문 직접 대조 완료 — 검증됨**: 최초 조회 시 두 3차 출처가
7611~7614 포함 여부를 놓고 상반된 주장을 해 미해결로 남겨뒀으나, 이후 EUR-Lex
consolidated text(CELEX:32023R0956, 2025-10-20 기준 — Regulation (EU) 2025/2083
"Omnibus" 개정 반영판, PDF를 직접 받아 pdftotext로 원문 대조)를 확인한 결과
**원래 목록이 정확했고, cbamguide.com의 "7611~7614 미포함" 주장이 오류였음을
확인했습니다.**

Annex I "Aluminium" 섹션 원문 그대로:

```
7601 – Unwrought aluminium                         CO2 + PFCs
7603 – Aluminium powders and flakes                CO2 + PFCs
7604 – Aluminium bars, rods and profiles           CO2 + PFCs
7605 – Aluminium wire                              CO2 + PFCs
7606 – Aluminium plates, sheets and strip (>0.2mm) CO2 + PFCs
7607 – Aluminium foil (≤0.2mm)                     CO2 + PFCs
7608 – Aluminium tubes and pipes                   CO2 + PFCs
7609 00 00 – Aluminium tube/pipe fittings          CO2 + PFCs
7610 – Aluminium structures and parts              CO2 + PFCs
7611 00 00 – Aluminium reservoirs/tanks (>300L)    CO2 + PFCs
7612 – Aluminium casks/drums/cans (≤300L)          CO2 + PFCs
7613 00 00 – Aluminium containers, compressed/liquefied gas  CO2 + PFCs
7614 – Stranded wire, cables (non-insulated)       CO2 + PFCs
7616 – Other articles of aluminium                 CO2 + PFCs
```

7602(secondary aluminium?), 7615(table/kitchen/household articles)는 Annex I에
등장하지 않음 — 기존에 파악한 제외 사실도 함께 확인됨. Annex I 표는 CN코드별로
"Carbon dioxide and perfluorocarbons"가 대상 GHG로 명시되어 있으나(법조문상
"규제 대상 온실가스"), 실제로 PFCs가 발생하는지는 [[2026-08-05-cbam-aluminum-guide]]
본문의 `aluminum_specific.pfcs_source`에서 설명한 대로 1차 제련 공정에만 해당
— Annex I의 GHG 열은 "이 CN코드에 대해 신고 가능한 GHG 종류"를 정의할 뿐,
"모든 사업장에서 실제로 발생한다"는 뜻은 아님. **이 CN코드 목록은 이제
`cbam.yaml`에 반영 가능한 수준으로 검증되었다고 판단합니다** (단, 8자리
코드 76090000/76110000/76130000의 표기가 정확한지 최종 확인은 여전히 사람
승인 절차를 거칠 것).

## 2. 신규 참고자료 제안 — `regulations/cbam-aluminum-methodology.yaml`

배출계수 수치가 아닌 **산정 방법론/절차**이므로 `status: draft`(또는 사람이 스키마에
`reference` 상태를 추가하기로 하면 그것)로 제안합니다.

```yaml
regulation_key: cbam-aluminum-methodology
jurisdiction: EU
version: "국문 해설서 2024-02-22 초안 기준 (전환기간 이행 가이드라인 v2.0.0 참조)"
effective_from: "2023-10-01" # CBAM 전환기간 시작
source_url: "" # TODO: 해설서 원문 발간처(추정 한국환경공단/생기연) 공식 URL 확인 필요
source_note: >
  로컬 PDF "유럽연합 탄소국경조정제도(CBAM) 알루미늄편 해설서.pdf"(2024-02-22 초안)
  요약. 원문은 (EU) CBAM Regulation 2023/956, CBAM Implementing Regulation,
  "EU 탄소국경조정제도 전환기간 이행 가이드라인"(환경부·산업부 공동개발)을 기준으로
  작성되었다고 명시함 (해설서 1p 일러두기). 상충 시 Regulation/Implementing
  Regulation 원문이 우선 적용된다고 해설서 자체가 명시.
status: draft

emission_boundary_hierarchy: # 사업장 > 시설군 > 생산공정 > 생산경로 > 배출원 > 소스 스트림
  levels:
    - 사업장 (installation): 사업자등록증/공장등록증 주소 기준 물리적 경계
    - 시설군 (installation group): CBAM 배출활동을 수행하는 제품 생산공정의 묶음
    - 생산공정 (production process): 1개 품목군과 매칭
    - 생산경로 (production route): 품목군 내 개별 품목(CN코드)의 생산공정
    - 배출원 (emission source)
    - 소스 스트림 (source stream): 연료/원료 중 실제 온실가스를 배출시키는 투입물
  multi_process_handling: >
    한 사업장에 여러 CBAM 제품 생산공정이 있으면 (a) 품목/품목군별로 산정경계를
    개별 구분하거나, (b) 전환기간 한정으로 "공동 생산공정(버블접근법)"으로 통합
    보고 가능. 버블접근법 조건: 생산된 전구물질이 공정 외부로 유출/판매되지 않고
    전량 공동 생산공정 내에서 소비되어야 함.
  non_target_process_note: >
    CBAM 비대상 제품 생산공정의 배출량 보고 의무는 없으나, 시설군 배출량의
    완전성을 위해 포함을 권장.

simple_vs_complex_products:
  simple_product: 내재배출량이 0인 원료·연료만 투입하여 생산된 제품.
  complex_product: 단순제품이 아닌 모든 제품. 생산공정 자체 배출 + 투입되는
    "전구물질(precursor)"의 내재배출량까지 합산해야 한다.
  precursor_rule: >
    전구물질은 CBAM이 규정한 물질만 해당하며(가공을 거쳤다고 자동으로 전구물질이
    되는 것은 아님), 시설군 내 다른 공정에서 자체 생산해 소비하는 경우와 외부
    구매하는 경우 모두 배출량 산정 대상에 포함된다.

aluminum_specific:
  scopes_reported: CO2, PFCs (알루미늄 부문은 CBAM 보고대상 온실가스 중 CO2·PFCs만 해당. N2O는 타 부문)
  pfcs_source: >
    PFCs는 알루미늄 괴 1차 제련(Primary electrolytic smelting) 공정에서만 발생한다.
    해설서에 따르면 국내에는 1차 제련 및 2차 제련(Secondary melting/recycling) 공정을
    보유한 업체가 없어(2024-02 기준), 국내 알루미늄 제조기업은 알루미늄 괴를 전량
    수입하여 사용한다 — 즉 최종 제품이 CBAM 대상이면 "수입 알루미늄 괴"의 제품당
    배출량(전구물질 내재배출량, PFCs 포함)을 해외 공급사로부터 확보해야 한다.
  korean_manufacturer_implication: >
    국내 알루미늄 가공업체는 자사 공정(2차 압출/판/박 등 제품 생산공정)에서는
    PFCs가 발생하지 않으므로 CO2 중심으로 소스 스트림을 확인하면 되지만, 수입한
    알루미늄 괴에 내재된 1차 제련 PFCs 배출량은 전구물질로서 반드시 포함해야 한다
    — 국내 SME 고객 대응 시 "우리 공정엔 PFCs가 없다"는 이유로 통째로 누락하면 안 됨.
    → CarbonGuard의 CBAM 알루미늄 리포트 로직은 반드시 "수입 전구물질(괴) 내재배출량
    입력/확보" 단계를 넣어야 한다 (root CLAUDE.md 완전성 요구사항과도 부합).
  scrap_definitions:
    pre_consumer: 제품 소비단계까지 도달하지 않고 공정 중 발생한 스크랩
    post_consumer: 제품 소비 이후 발생한 스크랩

direct_indirect_emissions:
  direct: 연료·원료 사용, 열/폐가스 유입출, (열병합발전시설의 경우) 전력 생산용 연료 연소로 인한 배출.
  indirect: 전력 사용에 따른 배출 (Scope 2에 해당).
  ghg_protocol_cross_ref: >
    이 구분은 [[2026-08-05-ghg-protocol-corporate-standard-reference]] 제안의
    Scope 1/2 정의와 사실상 동일하다 — CBAM 제품당 배출량 = GHG Protocol
    조직 단위 Scope 1/2를 "제품 1톤당" 원단위로 재구성한 것으로 이해하면 된다.

calculation_methods:
  standard_method: "표준방법 = 활동자료 × 배출계수 (연료연소는 연료사용량, 공정배출은 원료사용량)"
  mass_balance_method: "물질수지법 = [(투입 활동자료 × 탄소함량) − (산출 활동자료 × 탄소함량)] × (44/12 CO2 환산)"
  measurement_based_method: >
    연속 배출 측정 시스템(CEMS, 국내는 TMS)으로 배출가스 농도·유량을 직접 측정.
    N2O는 측정기반 방법론 사용이 필수. CO2는 계산기반보다 더 정확한 경우에만 사용 가능.
  domestic_alignment: 국내 목표관리제·배출권거래제는 계산기반 산정방법만 인정 (측정기반 불인정).

default_values_policy: # CBAM 기본값(default value) 사용 규칙 — 매우 중요, 시점 의존적
  transitional_free_use_until: "2024-07-31" # 이 시점까지는 기본값 자유 사용 가능
  transitional_cap_from: "2024-07-01" # 2026-08-05 웹 조회로 정정: 원래 "2024-08-01"로 적었으나
    # EU 집행위 공식 발표(2023-12-22 보도자료)는 "2024년 Q3(=2024-07-01)부터 2025년 말까지
    # 복합제품 한정 20% 상한"이라고 명시. 자유 사용 마감(07-31)과 20%-상한부 estimation 시작이
    # 겹치는 구간이 있는 것으로 보이며 정확한 조문 대조는 [[2026-08-05-cbam-legal-translation-v3]]
    # §"✅ 웹 조회 검증" 참조.
  transitional_cap_rule: 2024년 Q3(2024-07-01)부터 2025년 말까지는 복합제품 배출량 중 20%에 해당하는 데이터에만 기본값(추정값) 적용 가능.
  note: >
    이 규칙은 "전환기간"(2023-10-01~2025-12-31) 기준이다. 확정기간(2026-01-01~)에는
    별도의 기본값 체계가 적용된다 — 2026-08-05 웹 조회로 확인: Implementing Regulation
    (EU) 2025/2621이 확정기간용 국가·CN코드별 기본값(단계적 마크업, 2028년까지 최대 +30%)을
    규정한다. 상세는 [[2026-08-05-cbam-legal-translation-v3]] 참조 — 단, 그 문서에서도
    EUR-Lex 원문 대조는 아직 완료되지 않았다.
  electricity_default_factor_access: >
    EU 기본 전력 배출계수(IEA 데이터 기반)는 "수입업자용 CBAM 등록부(Registry)"에서만
    공개되어 일반 접근이 불가능하다 — [[2026-08-05-ghg-protocol-corporate-standard-reference]]
    제안의 부록 A(EFG/EFC) 항목과 결합해서 볼 것. 따라서 국내 수출기업은 전환기간에는
    "국내(한국) 전력 배출계수"를 사용해야 한다고 해설서가 명시. 이는 packages/ruleset/
    factors/kr-nga/*/electricity.json이 TODO로 비어 있는 지금 상태와 직결된다 —
    이 계수가 채워져야 CBAM 알루미늄 제품의 간접배출(Scope 2 상당) 산정이 가능하다.
  renewable_electricity: >
    재생에너지 발전 전력 사용 시 배출계수는 0으로 적용. 단, CBAM은 REC 등 시장기반
    방법(market-based, 인증서 구매)을 인정하지 않으며, PPA(전력구매계약) 체결이
    입증되는 경우에만 예외적으로 해당 발전설비의 배출계수 사용 가능
    (2023-11-15 EU CBAM 인포세션 Q&A 근거, 가이드라인 부록 2).
    한전 구매전력과 재생에너지를 함께 쓰면 유형별 사용량 가중평균 적용.

cogeneration_defaults: # 열병합발전시설(CHP) 배출계수 개발용 기본 효율값 — Implementing Regulation 부속서 근거로 추정
  heat_efficiency_default: 0.55
  power_efficiency_default: 0.25
  priority_order: "측정값 > 설계값 > 기본값 순으로 정확도가 높다고 간주"
  waste_gas_rule: >
    연료에 폐가스가 포함된 경우, 폐가스 배출계수가 천연가스 표준 배출계수보다 크면
    폐가스 배출계수 대신 천연가스 표준 배출계수를 적용해야 한다 (보수적 산정 원칙).

applicability_to_carbon_guard: >
  CarbonGuard의 `regulations/cbam.yaml`은 현재 covered_sectors에 aluminium을 문자열로만
  갖고 있고 reporting_requirements가 전부 TODO다. 이 해설서는 "무엇을 어떻게 산정할지"의
  실무 절차를 상세히 제공하므로, compliance-generator가 CBAM 알루미늄 보고서를 만들 때
  다음을 반드시 체크리스트로 요구해야 한다:
  (1) 수입 알루미늄 괴(전구물질)의 PFCs 포함 내재배출량 확보 여부,
  (2) 국내 전력 배출계수 사용 여부(EU 기본값이 아님을 명시),
  (3) 단순제품/복합제품 구분 및 전구물질 목록,
  (4) 기본값 사용 시 20% 상한 준수 여부(단, 확정단계 규칙 재확인 필요),
  (5) 계산기반(표준법/물질수지법) 중 어느 방법을 썼는지 및 근거.
  이 중 (2)는 packages/ruleset/factors/kr-nga 배출계수가 채워지기 전까지는 실행 불가능
  하므로, 그 작업의 우선순위 근거로도 사용할 수 있다.

not_covered: >
  해설서 전체 분량 중 활동자료 모니터링 방법(표 11·12, 예외사항), 열/폐가스 귀속배출
  산정(4장 상세 수식), 데이터 할당(생산공정별 분배) 세부 수식, 부록의 CN코드 전체
  매핑표(품목군별)는 표/그림 형태로 존재해 이번 텍스트 추출에서 신뢰성 있게 읽어내지
  못했다. 실제 반영 시 사람이 원문 PDF를 직접 열어 해당 표·그림을 확인할 것을 권장.
