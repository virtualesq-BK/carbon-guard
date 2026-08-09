---
name: cbam-xml
description: CBAM XML 초안 생성 절차와 검증 체크리스트. compliance-generator/compliance-evaluator 관련 작업, CBAM 리포트 디버깅 시 사용.
---

# CBAM XML 생성 절차

3번 이상 반복된 "확정 배출량 → CBAM XML 초안" 작업을 절차화한 것.
구현: `packages/report-templates/src/cbam-xml.ts`(생성),
`agents/compliance-generator/src/build-cbam-report.ts`(오케스트레이션),
`agents/compliance-evaluator/src/structural-checks.ts`(검증).

## 1. 생성 절차

1. 대상 회사·기간의 `emission_records`를 **confirmed 상태**만 조회한다
   (`utility_bills.status = 'confirmed'`를 거쳐 계산된 것만).
2. `emission-engine`이 이미 계산한 `emission_value`(tCO2e)를 그대로 사용한다
   — compliance-generator는 배출량을 재계산하지 않는다.
3. `buildCbamXml()`이 XML 문자열을 생성한다. **항상 `status="DRAFT"`**로
   고정되며, `Emissions total` 속성은 개별 `ValueTco2e` 합계와 자동으로
   일치한다(코드가 직접 sum한다 — 사람이 손으로 더하지 않는다).
4. `reports` 테이블에 `status: "draft"`로 insert. 이 시점에는 **아직 아무도
   승인하지 않은 상태**다.

## 2. 검증 체크리스트 (compliance-evaluator가 자동 수행)

사람이 최종 승인하기 전에 아래가 전부 통과했는지 `reports.evaluator_findings`를
확인한다:

- [ ] `content.xml`이 비어 있지 않다
- [ ] `used_emission_record_ids`가 비어 있지 않다 (최소 1개 이상의 근거 데이터)
- [ ] 모든 `FactorRef`가 비어있지 않고 `TODO`가 아니다 (미확정 계수 사용 금지)
- [ ] `Emissions total` == 개별 `ValueTco2e` 합계 (오차 0.001 이내)
- [ ] XML의 `ReportingPeriod`가 `reports.period_start/end`와 일치
- [ ] `risk_score <= 70` (초과 시 `high_risk_report_publish` 승인 필요)

이 체크리스트에 해당하는 코드는 `checkCbamReport()`이며, 항목이 늘어나면
이 문서와 함수를 함께 갱신한다.

## 3. 사람 승인 (승인 게이트 ②)

`status: "evaluated"`가 된 리포트를 사람이 검토해 `status: "approved"` →
실제 제출 시 `submitted`로 바꾼다. **compliance-generator나
compliance-evaluator 어느 쪽도 이 전환을 스스로 하지 않는다.**
