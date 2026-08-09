# 제안: `factors/kr-nga/2026-01/electricity.json` 확정치 반영 (국내 전력배출계수 2023년도)

- 감지 계기: 데모 페이지("배출량 계산 체험하기")의 "한국 전력 사용량" 계산이
  `kr-nga/electricity`가 TODO라서 항상 실패하는 것을 사용자가 확인함.
- 작성자: reg-watcher 역할 수행 (Claude, 세션 기준 2026-08-05, WebSearch/WebFetch로 조사)
- **반영 상태: `factors(sample)/kr-nga-electricity/2026-01/south-korea.json`에
  `verification: corroborated-secondary` 등급으로 임시 반영 완료 (데모 API가 자동
  폴백으로 사용 중). `factors/`(공식 source of truth) 반영은 미완료 — 사람 승인 필요.**

## 조사 결과

기후에너지환경부·국가 온실가스 통계 관리위원회가 2025-12-17 "2023년도 전력배출계수"를
**0.4173 tCO2eq/MWh**로 확정·공표했다고 독립 언론 4곳(에너지신문, 다음뉴스, CO2Korea,
K-ESG)이 일치하여 보도했습니다. 이전 공표치(2025-03-31, 2020~2022년 평균)는
0.4541 tCO2eq/MWh였고, 2025년 12월부터 공표 주기가 3년→1년으로 단축되어 매년
갱신된다고 합니다.

## 검증하지 못한 것 — factors/로 승격 전 반드시 확인 필요

1. **발전단(EFG) vs 소비단(EFC) 여부**: 뉴스 기사 어디에도 명시되어 있지 않았습니다.
   `regulations/ghg-protocol.yaml`의 `appendix_a_purchased_electricity`에 따르면
   GHG Protocol Scope 2는 반드시 발전단(EFG) 계수를 요구합니다. 이 값이 소비단이라면
   그대로 쓰면 안 됩니다.
2. **1차 출처 미열람**: GIR 홈페이지(gir.go.kr)의 원문 게시글은 세션형 URL이라 이번
   조회로 직접 열람하지 못했습니다. 메뉴ID 36("국가·지역 온실가스 통계")에서 사람이
   직접 찾아 대조해야 합니다.
3. **다른 유사 수치와 혼동 주의**: `factors(sample)/cbam-scope2-electricity/2026-01/south-korea.json`에
   있는 "2021년 국가고유 배출계수 0.4747 tCO2/MWh"는 CBAM 제출용이 **아니라고
   명시**되어 있어 이번 값(0.4173, 국내 일반 공시용)과 다른 값·다른 용도입니다.
   또한 배출권거래제(K-ETS) 정산은 할당 시점 계수를 그대로 유지하므로, 이번 값을
   K-ETS 정산에 쓰면 안 됩니다 — 일반 기후공시·ESG 보고서용입니다.

## 승격 절차 (root CLAUDE.md 승인 게이트 ①)

1. 사람이 GIR 홈페이지에서 2025-12-17(또는 그 직후) 게시된 "2023년도 전력배출계수"
   원문을 직접 확인, 발전단/소비단 여부와 수치를 대조.
2. 일치하면 `factors/kr-nga/2026-01/electricity.json`의 `value`를 채우고 `source`를
   GIR 원문 URL로 교체.
3. `changelog.md`에 근거 URL과 함께 기록.
4. 승인 후 `factors(sample)/kr-nga-electricity/2026-01/south-korea.json`은 삭제
   (README의 "factors/로 승격하는 절차" 참조).
