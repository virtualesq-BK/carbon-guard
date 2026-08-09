# CarbonGuard — 프로젝트 지도

## 제품
한국 수출 중소 제조기업(비전문가, 법무/ESG 담당자 없음)을 위한 AI 기반
공급망 탄소 컴플라이언스 SaaS. 전력·연료 고지서를 올리면 배출량을 계산하고
EU CBAM / 美 CCA / CSRD 보고서 초안을 생성한다.

## 폴더 지도
- `apps/web` — Next.js 14 App Router UI. 서버 사이드에서만 Anthropic API 호출.
- `packages/emission-engine` — 배출량 계산 **순수함수만**. LLM 호출 금지 구역.
- `packages/ruleset` — ★ 핵심 자산. 배출계수·규제 룰의 유일한 출처(source of truth).
  - `factors/<체계>/<버전>/*.json` — 배출계수. 절대 다른 코드에 하드코딩 금지.
  - `regulations/*.yaml` — CBAM/CCA/CSRD 룰.
  - `changelog.md` — 모든 변경 이력(누가·언제·근거 URL). 기록 없는 커밋 금지.
- `packages/report-templates` — CBAM XML / CCA 예측서 / ESG 보고서 템플릿.
- `agents/<역할>/` — 역할별 에이전트, 각자 CLAUDE.md 보유 (트리거·도구·승인지점·로그 형식).
- `mcp/` — MCP 서버 설정(supabase, filesystem, fetch).
- `skills/` — 3회 이상 반복된 작업을 승격한 재사용 절차.
- `sop/` — 사람이 읽는 표준운영절차.
- `hooks/` — Claude Code 훅 스크립트(승인 게이트 강제).
- `logs/YYYY-MM-DD/<agent>.md` — 에이전트 실행 로그.

## 금지 행동 5가지
1. **배출계수·규제 수치를 지어내지 말 것.** 모르면 값 대신 `TODO`를 넣고
   `source` 필드는 비운 채로 둔다. 절대 그럴듯한 숫자를 생성하지 않는다.
2. **emission-engine 내부에서 LLM 호출 금지.** 계산은 결정론적 순수함수여야
   재현 가능하고 감사 가능하다.
3. **ruleset 변경 시 `changelog.md` 기록 없이 커밋 금지.** 모든 변경은
   누가/언제/근거 URL을 남긴다.
4. **외부 발송(이메일·제출)·프로덕션 DB 쓰기·ruleset 반영은 승인 게이트
   통과 필수.** 자동화 파이프라인이 대신 승인하지 않는다.
5. **Generator 에이전트는 자기 결과물을 스스로 승인 금지.** 검증은 반드시
   별도 프롬프트/역할을 가진 compliance-evaluator가 수행한다.

## 승인 게이트 — `approvals` 테이블 기반 7 체크포인트
① ruleset(배출계수·규제 룰) 변경 반영 ② CBAM XML 등 외부 제출용 리포트 최종 확정
③ 고객 대상 이메일·알림 발송 ④ DB 삭제·정정(과거 배출 기록 수정)
⑤ 요금·결제 관련 변경 ⑥ OCR confidence<0.8 데이터의 확정
⑦ 리스크 스코어 70점 초과 리포트의 발행
모두 `approvals` 테이블에 `pending` 레코드가 생성되고, 사람이 UI 대기열에서
승인/반려해야 실제 쓰기가 실행된다. 에이전트가 스스로 승인 상태를 바꾸지 않는다.

## 오케스트레이션 원칙
- 기본은 단일 에이전트 순차 실행. 병렬은 OCR 배치 처리처럼 상호 의존성 없는
  작업에만 허용.
- 에이전트 간 통신은 DB/파일 경유만 허용, 직접 호출 금지:
  `data-collector → utility_bills(DB) → emission-engine → reports(DB)
  → compliance-evaluator → approvals(대기열)`
- MCP 도구는 점진 원칙: ① 읽기 전용 도구부터 연결 ② 모든 쓰기 도구는
  `dry_run=true` 기본값 ③ 실제 쓰기는 `approvals`에 승인 레코드가 있을 때만 실행.

## 원칙
- Agent = Model + Harness. 모델의 판단력을 하네스(스키마 검증, 승인 게이트,
  로그, 결정론적 엔진)로 감싸 신뢰 가능한 시스템을 만든다.
- 배출계수는 `packages/ruleset/factors`가 유일한 출처. 코드에 숫자를
  하드코딩하지 않는다.
- compliance-evaluator는 compliance-generator와 별도 시스템 프롬프트·별도
  컨텍스트로 실행한다 (같은 모델이어도 프롬프트 재사용 금지).
- evaluator 평가 기준: 필수 필드 누락, 기간 불일치, 계수 출처 미기재,
  단위 오류, False Claims 리스크 요소.
- 3번 이상 반복된 작업은 `skills/`로 승격, 3번 이상 반복된 실수는 이 파일에
  Rule로 추가한다.
