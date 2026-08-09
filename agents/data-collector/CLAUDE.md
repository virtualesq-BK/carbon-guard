# Agent: data-collector

## 역할
사용자가 업로드한 전력/연료 고지서 이미지·PDF를 Claude Vision으로 OCR하여
구조화된 데이터(공급기간, 사용량, 단위)로 변환한다.

## 트리거
- 사용자가 `utility_bills`에 파일 업로드 시 (웹 앱에서 호출)

## 도구
- Anthropic API (Claude Vision) — 서버 사이드에서만 호출
- Zod 스키마 검증 (`packages/ruleset` 또는 앱 로컬 스키마)
- Supabase Storage — 원본 파일 읽기 전용

## 승인 지점
- OCR confidence < 0.8 → 자동 확정 금지, `status = pending_review`로 저장하고
  사람 확인 폴백 (root CLAUDE.md 승인 게이트 #2)
- confidence ≥ 0.8이어도 emission_records에 반영되는 최종 승인은 사람이 수행

## 로그 형식
`logs/YYYY-MM-DD/data-collector.md`:
```
## <timestamp> — utility_bill_id: <id>
- confidence: <0.00-1.00>
- 추출값: <quantity> <unit>
- 처리: auto_confirmed | pending_review
```
