# Proposals (reg-watcher 출력)

reg-watcher가 `packages/ruleset/factors`/`regulations`의 원문 소스에서 변경을
감지하면 이 디렉토리에 제안 마크다운 파일을 생성한다. reg-watcher는 이
디렉토리 밖으로는 어떤 쓰기도 하지 않는다 — `factors/`, `regulations/`,
`changelog.md`는 오직 사람이 제안을 검토한 뒤 직접 수정한다
(root CLAUDE.md 승인 게이트 ①, 자동 병합 절대 금지).

반영이 끝난 제안 파일은 삭제하거나 `archive/`로 옮긴다.
