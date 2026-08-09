# Ruleset Changelog

모든 `factors/` 및 `regulations/` 변경은 여기에 기록한다.
형식: `## YYYY-MM-DD — <파일 경로>` 아래에 누가/근거 URL/변경 요약.
커밋 전 이 파일에 항목이 없으면 ruleset 변경을 반영하지 않는다
(root CLAUDE.md 금지 행동 ③, `pnpm --filter ruleset test`의 changelog 강제 유틸이 검사).

## 2026-07-22 — packages/ruleset/factors/kr-nga/2026-01/electricity.json

- 작성자: scaffolding (Phase 1)
- 근거 URL: (없음 — 초기 placeholder)
- 변경 요약: 파일 구조만 생성. `value`/`source`는 의도적으로 TODO/빈 값.
  reg-watcher가 온실가스종합정보센터(GIR) 공식 배출계수를 확인하여
  제안 PR을 올리면, 사람이 근거 URL과 함께 승인 후 값을 채운다.

## 2026-07-22 — packages/ruleset/regulations/cca.yaml

- 작성자: Phase 5 (compliance-generator CCA 세액 시뮬레이터 구현)
- 근거 URL: (없음 — 공식 법령 아님, 공개적으로 자주 인용되는 CCA 발의안 예시치)
- 변경 요약: `tax_model`(공식 확정치)은 여전히 TODO로 유지. 별도로
  `simulation_assumptions` 블록을 추가해 시뮬레이션 전용 가정치
  ($55/ton, 2025년 기준, 연 2.5% 인플레)를 명시하고, 이 값은
  `packages/report-templates/src/cca-tax.ts`의 `CCA_SIMULATION_CONFIG`와
  동기화됨을 문서화. 시뮬레이터 결과는 항상 "SIMULATION ONLY"로 표기.

## 2026-08-05 — packages/ruleset/regulations/cbam.yaml

- 작성자: virtual.esq@gmail.com (사용자 승인, Claude가 EUR-Lex 원문 대조 후 초안 작성)
- 근거 URL: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02023R0956-20251020
  (consolidated text, Regulation (EU) 2023/956 as amended by (EU) 2025/2083)
- 변경 요약: covered_sectors를 문자열 목록에서 CN코드 포함 구조로 확장.
  알루미늄/철강/시멘트/비료/수소/전력 CN코드를 EUR-Lex 원문과 직접 대조하여 반영
  (packages/ruleset/proposals/2026-08-05-cbam-*.md 시리즈 참조). 철강 페로합금
  제외 범위를 "실리코 계열만 제외"로 정정, 시멘트 ex 25070080 항목 추가,
  비료 3102/3105 범위 정정. procedural_requirements(전환기간/확정기간 타임라인,
  승인신고인 요건, 검증·과징금 근거, 기본값 사용 규칙)를 신규 추가하되
  certificate_annual_deadline과 확정기간 기본값 방법론(IR 2025/2621)은 2차
  출처 기반이라 TODO로 유지. status는 draft 유지(배출계수·일부 절차 수치 미확정).

## 2026-08-05 — packages/ruleset/regulations/ghg-protocol.yaml

- 작성자: virtual.esq@gmail.com (사용자 승인, Claude 초안 작성)
- 근거 URL: https://ghgprotocol.org/corporate-standard
- 변경 요약: 신규 파일. GHG Protocol Corporate Standard(한국어 번역본 2025-06)
  요약(조직/운영경계, Scope1/2/3 정의, 기준연도 재계산, 필수보고항목, 부록A
  EFG/EFC)에 「글로벌 공시기준 Scope1,2 조직경계·배출량 산정 사례집」
  (기후에너지환경부·한국환경산업기술원, 2026-02)의 boundary_case_patterns(국내
  실제 판단사례 8건), activity_data_maturity_types(Type1/2/3), IFRS S2 vs ESRS
  Scope2 이중보고 차이를 통합. 배출계수 수치는 포함하지 않음(방법론 참고자료).
  status는 draft(스키마가 reference 상태를 지원하지 않아 임시로 draft 사용 —
  packages/ruleset/proposals/2026-08-05-ghg-protocol-corporate-standard-reference.md
  §"함께 검토가 필요한 부수 사항" 참조, schema.ts 확장 여부는 별도 결정 필요).

## 2026-08-05 — packages/ruleset/regulations/csrd.yaml

- 작성자: virtual.esq@gmail.com (사용자 승인, Claude 초안 작성)
- 근거 URL: (2차 자료 — 정부 발간 사례집, 공식 EUR-Lex ESRS 조문 대조는 아직 안 함)
- 변경 요약: scope2_reporting 블록 추가. ESRS는 IFRS S2와 달리 Scope 2
  지역기반+시장기반 총배출량을 모두 공시해야 함을 명시(출처: 기후에너지환경부·
  한국환경산업기술원 2026-02 발간 사례집 PART II). 그 외 esrs_standards,
  reporting_requirements는 여전히 TODO로 유지.
