# factors(sample)/ — 비공식 샘플 배출계수 (반영 대기)

이 디렉토리는 `packages/ruleset/factors/`(공식 source of truth)가 **아닙니다.**
`emission-engine`의 `FACTORS_ROOT`는 여전히 `factors/`만 가리키며, 여기 있는
파일은 `resolveFactor`/`loadAllFactors`에 절대 자동으로 로드되지 않습니다.

## 왜 별도 디렉토리인가

2026-07-24 세션에서 사용자가 제공한 CBAM 확정단계(2026~) Scope 1/2/벤치마크
수치를 정리한 결과입니다. root CLAUDE.md 금지행동 ①("배출계수·규제 수치를
지어내지 말 것")과 승인 게이트 ①(ruleset 반영은 사람 승인 필수)에 따라,
아직 1차 공식 출처(EUR-Lex Official Journal 원문) 대조가 끝나지 않은 값을
바로 `factors/`에 넣을 수 없습니다. 그래서 검증 수준을 파일 단위로 명시한
샘플 스테이징 영역으로 분리했습니다.

관련 제안 문서:
- `packages/ruleset/proposals/2026-07-24-cbam-scope1-scope2-factors.md`
- `packages/ruleset/proposals/2026-07-24-cbam-definitive-phase-update.md`

## 검증 등급 (`notes.verification` 필드)

| 등급 | 의미 |
|---|---|
| `corroborated-secondary` | 규정 실존·시행일은 EUR-Lex로 확인, 수치 자체는 독립된 2차 출처(업계 매체) 2곳 이상이 일치. 1차 Annex 원문은 미열람. |
| `unverified-user-claim` | 사용자가 제공한 값이며, 이번 세션에서 1차·2차 출처 대조를 시도했으나 실패했거나 시도하지 못함. `value`는 `TODO`로 유지. |

## `factors/`로 승격하는 절차

1. 사람이 해당 규정의 EUR-Lex Official Journal 원문(Annex 표)을 직접 대조.
2. 값이 원문과 일치하면 `factors/<체계>/<버전>/*.json`에 옮기고 `source`를
   EUR-Lex 정확한 조항 URL로 교체.
3. `packages/ruleset/changelog.md`에 근거 URL과 함께 기록.
4. 승인 게이트 ①을 통과한 뒤에만 `emission-engine`이 사용할 수 있음.
