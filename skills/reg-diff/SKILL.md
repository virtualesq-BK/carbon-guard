---
name: reg-diff
description: 규제/배출계수 원문 소스의 변경을 감지해 diff 요약과 changelog.md 초안을 만드는 절차. reg-watcher 관련 작업, ruleset 업데이트 검토 시 사용.
---

# 규제 원문 diff → changelog 초안 절차

3번 이상 반복된 "원문 소스 조회 → 변경 감지 → 사람 검토용 제안 작성" 작업을
절차화한 것. 구현: `agents/reg-watcher/src/`.

## 1. 조회 대상 관리

`agents/reg-watcher/sources.yaml`에 소스를 등록한다. **`verified: false`가
기본값**이며, 사람이 URL이 실제로 맞는 공식 출처인지 확인한 뒤에만
`true`로 바꾼다 — 확인 안 된 URL은 reg-watcher가 절대 조회하지 않는다.

## 2. 변경 감지

1. `fetchSourceText()`로 페이지 텍스트를 가져온다.
2. `computeContentHash()`(SHA-256)로 콘텐츠 지문을 만들고,
   `agents/reg-watcher/state/`에 저장된 이전 해시와 비교한다.
3. 해시가 다르면(또는 최초 조회면) 변경으로 판단한다. 이 방식은 페이지의
   *어떤 부분*이 바뀌었는지는 알려주지 않는다 — 사람이 직접 열어봐야 한다.
   (더 정교한 diff가 필요하면 이 단계를 확장할 것.)

## 3. 제안 파일 작성 (사람 검토용, 자동 반영 아님)

`buildProposalMarkdown()`이 `packages/ruleset/proposals/<날짜>-<key>.md`를
생성한다. 이 파일은:

- 어떤 key(`factor_key` 또는 `regulation_key`)가 영향을 받는지
- 출처 URL과 조회 시각
- "다음 단계"로 사람이 해야 할 일(원문 확인 → 파일 직접 수정 → changelog 기록)

을 담는다. **reg-watcher는 이 디렉토리 밖으로 어떤 쓰기도 하지 않는다.**

## 4. changelog.md 초안 작성 형식 (사람이 직접 채움)

제안을 검토해 실제로 `factors/` 또는 `regulations/`를 고쳤다면,
`packages/ruleset/changelog.md`에 아래 형식으로 추가한다:

```
## YYYY-MM-DD — packages/ruleset/<factors|regulations>/<경로>

- 작성자: <이름>
- 근거 URL: <출처 URL>
- 변경 요약: <무엇이 왜 바뀌었는지, 이전 값과 새 값>
```

이 항목이 없으면 `pnpm --filter ruleset verify-changelog`가 커밋을 막는다
(root CLAUDE.md 금지 행동 ③).

## 5. 반영 후 정리

처리 완료된 제안 파일은 `packages/ruleset/proposals/`에서 삭제하거나
별도 archive 폴더로 옮긴다.
