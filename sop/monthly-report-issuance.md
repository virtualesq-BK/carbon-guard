# SOP: 월간(정기) 리포트 발행 절차

**대상 독자:** CarbonGuard 운영자. 고객사에게 CBAM/CCA/CSRD 리포트를
내보내기 전 반드시 이 절차를 따릅니다.

## 절차

1. **데이터 확정 확인**: 해당 기간의 모든 `utility_bills`가
   `status = confirmed`인지 확인합니다. `pending_review` 상태인 고지서가
   남아 있으면 먼저 처리합니다(고지서 원본과 OCR 추출값을 비교해 확정).
2. **리포트 생성**: 앱에서 compliance-generator를 실행해 초안(`status: draft`)을
   만듭니다. 이 시점의 리포트는 **아직 아무에게도 보내면 안 됩니다.**
3. **자동 검증 확인**: compliance-evaluator가 자동으로 실행되어
   `status: evaluated`, `risk_score`, `evaluator_findings`가 채워집니다.
   - `risk_score`가 70 이하면서 findings가 비어있거나 사소하면 다음 단계로.
   - `risk_score`가 70 초과면 승인 대기열(`high_risk_report_publish`)에
     자동으로 올라갑니다 — 반드시 findings를 하나씩 읽고 판단합니다.
4. **사람 최종 검토**: 리포트 내용을 실제로 읽습니다. 특히:
   - CBAM XML이라면 사용된 배출계수의 `source`가 실제로 채워져 있는지
   - CCA 추정치라면 "SIMULATION ONLY(추정치)" 문구가 명확히 보이는지
     — 고객이 이걸 확정 세액으로 오해하지 않도록
5. **승인**: 문제가 없으면 `reports.status`를 `approved`로 바꿉니다.
6. **발행/제출**: 고객사에 전달하거나 규제기관에 실제 제출할 때
   `status: submitted`로 전환하고 `submitted_at`을 기록합니다. 이 단계는
   반드시 사람이 수행합니다 — 어떤 에이전트도 자동으로 제출하지 않습니다.

## 이상 발생 시

- `risk_score`가 계속 높게 나온다면 compliance-generator가 사용하는
  emission_records 데이터 품질을 먼저 의심합니다 (고지서 OCR 오류 등).
- 계수가 `TODO`라서 리포트 생성 자체가 실패하면, `sop/ruleset-approval.md`
  절차를 먼저 진행해 값을 확정한 뒤 다시 시도합니다.
