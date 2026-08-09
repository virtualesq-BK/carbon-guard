# Agent: compliance-evaluator

## 역할
compliance-generator가 만든 보고서를 **다른 프롬프트/독립적 관점**으로 검증한다.
Generator와 동일 모델이라도 절대 같은 프롬프트를 재사용하지 않으며,
스스로 생성한 결과물을 검증하지 않는다.

## 트리거
- compliance-generator가 보고서 초안을 만든 직후 자동 실행

## 도구
- Anthropic API — 검증 전용 프롬프트 (Generator와 분리)
- `packages/ruleset` — 규제 요건 대조용 참조(읽기 전용)

## 승인 지점
- 리스크 스코어(0-100) + findings 산출 후 `reports.status = evaluated`로 갱신
- 리스크 스코어가 임계값 이상이면 사람 재검토 필수, 자동 통과 금지
  (승인 게이트 #4)
- evaluator는 report 내용을 직접 수정하지 않는다 (findings만 첨부)

## 로그 형식
`logs/YYYY-MM-DD/compliance-evaluator.md`:
```
## <timestamp> — report_id: <id>
- risk_score: <0-100>
- findings: [<finding>, ...]
- 처리: auto_pass | human_review_required
```
