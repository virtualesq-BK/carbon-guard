## 2026-07-24 (Claude, reg-watcher 역할 수행)

- 감지 항목: cbam (regulation_key) — Scope 1/Scope 2 배출계수 제안
- 출처 URL:
  - https://taxation-customs.ec.europa.eu/system/files/2023-12/Default%20values%20transitional%20period.pdf (확인 성공)
  - https://eur-lex.europa.eu/eli/reg_impl/2023/1773/oj (Annex VIII 원문 확인 실패 — 빈 응답)
  - https://taxation-customs.ec.europa.eu/system/files/2023-11/CBAM%20Guidance_EU%20231121%20for%20web_0.pdf (확인 실패 — PDF 파싱 불가)
- 판단 근거: 사용자가 제공한 CBAM Scope 1/2 배출계수 수치가 "본인 지식 기준,
  미검증"이라 명시했음. 프로젝트 규칙(root CLAUDE.md 금지행동 ①)에 따라
  검증 없이 ruleset/factors에 반영할 수 없어, 원문 대조를 시도함.
  대조 결과: (1) 실제로 확인된 EU 집행위 문서는 사용자가 요청한 Annex VIII
  연료별 계수가 아니라 품목별(CN 코드) 최종 계수였고, 이마저도 전환기간
  (~2025-12-31) 전용으로 오늘(2026-07-24) 기준 시효 만료. (2) 한국 전력
  배출계수는 공개 문서에 없고 CBAM Registry 로그인 필요. (3) Annex VIII
  원문은 도구 한계로 확보 실패.
- 제안 파일: packages/ruleset/proposals/2026-07-24-cbam-scope1-scope2-factors.md
- 결론: factors/regulations 파일 미변경. 사람 검토·추가 조사 필요.

## 2026-07-24 (2차 조회, 확정단계 자료)

- 감지 항목: cbam — 사용자가 확정단계(2026~) 기준 자료로 재요청
- 출처 URL:
  - https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ%3AL_202502621 (조회 실패 — 응답 크기 초과)
  - https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202502620 (부분 확인 — 벤치마크 수치표 미포함)
  - WebSearch로 EUROMETAL, CBAM Guide 등 2차 출처 교차 확인
- 판단 근거: IR 2025/2621, 2025/2620의 실존·시행일은 확인됨. 철강 HRC 벤치마크
  (1.370/0.481/0.072 tCO2e/t)는 독립된 2차 출처 2곳이 일치해 신뢰도가 높으나
  1차 공식 원문(EUR-Lex Annex)은 열람하지 못함. 연료계수·공정배출계수·한국
  전력계수는 여전히 미확인.
- 제안 파일: packages/ruleset/proposals/2026-07-24-cbam-definitive-phase-update.md
- 결론: factors/regulations 파일 미변경. 사람이 IR 2025/2620 Annex 원문 최종
  대조 후 반영 권장.

## 2026-07-24 (3차 조회, 중국 기본값·마크업·CBAM 팩터·PFC GWP)

- 감지 항목: cbam — 중국 철강 슬라브 기본값, 마크업 일정, CBAM 팩터, 알루미늄
  PFC GWP, PART 2 탄소 계약조항 참고자료
- 출처 URL: WebSearch 교차 확인 (EUROMETAL, CBAM Guide, EPA 온실가스
  인벤토리 부록, IPCC AR5)
- 판단 근거: 중국 철강 슬라브 기본값 3.167 tCO2e/t는 2차 출처 2곳 일치로
  factors(sample)에 반영. CF4/C2F6 GWP(6,630/11,100)는 IPCC AR5 원자료로
  확인해 factors(sample)에 반영. 마크업 일정은 사용자 제공값이 2단계
  (10%→30%)였으나 실제로는 3단계(10%/2026→20%/2027→30%/2028~)로 확인되어
  정정. CBAM 팩터는 방향은 맞으나 용어 혼동 우려로 원문 대조 전까지 미반영.
  PART 2 계약조항은 사용자 스스로 "일반 지식, 미검증"으로 표기해 별도
  비공식 참고문서로만 저장.
- 제안 파일: packages/ruleset/proposals/2026-07-24-cbam-china-default-markup-pfc.md
- 기타 산출물: sop/carbon-contract-clauses-reference.md (계약조항, 법률 검토 전 사용 금지 명시)
- 결론: factors/regulations 파일 미변경. factors(sample)에 중국 기본값·PFC
  GWP 3개 파일 추가.
