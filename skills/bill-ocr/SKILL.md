---
name: bill-ocr
description: 전력/가스/연료 고지서 OCR 추출 절차 — 유형별 프롬프트 차이, JSON 스키마, confidence<0.8 사람 확인 폴백. data-collector 에이전트 관련 작업(고지서 업로드 처리, OCR 실패 디버깅) 시 사용.
---

# 고지서 OCR 절차

3번 이상 반복된 "고지서 업로드 → 데이터 추출" 작업을 절차화한 것.
구현은 `agents/data-collector/src/`에 있음 — 이 문서는 그 구현을 사람이
이해하고 신뢰할 수 있도록 설명하는 지도다.

## 1. 유형별 차이

`bill_type`은 `electricity | gas | fuel | steam | other` 중 하나
(`agents/data-collector/src/schema.ts`의 `BillExtractionSchema` 참고).
유형에 따라 사람이 흔히 헷갈리는 포인트:

- **electricity**: 단위는 보통 `kWh`(가정용) 또는 `MWh`(산업용 대량). 청구서에
  두 단위가 섞여 표기되는 경우가 있으니 `extracted_unit`을 반드시 확인한다.
- **gas**: 단위는 `m3` 또는 `MJ`(열량 환산)일 수 있다. 열량 환산 계수가
  청구서에 따로 적혀 있으면 원본 단위(`m3`)를 그대로 추출하고 환산은
  emission-engine 쪽에서 처리하게 한다 — OCR 단계에서 직접 환산하지 않는다.
- **fuel**: 리터(`L`) 단위가 일반적. 유종(경유/휘발유 등)에 따라 배출계수가
  다르므로, 가능하면 청구서에서 유종 정보도 함께 읽어 `bill_type: "fuel"`
  외에 별도 메모(향후 스키마 확장 여지)로 남긴다.
- **steam**: 산업단지 스팀 공급 고지서. 단위는 `GJ` 또는 `ton`이 흔하다.

## 2. JSON 스키마

`agents/data-collector/src/schema.ts`의 `BillExtractionSchema`(Zod)와
`BILL_EXTRACTION_TOOL`(Anthropic tool-use 스키마)이 단일 진실 소스다.
필수 필드: `bill_type`, `billing_period_start/end`(YYYY-MM-DD),
`extracted_quantity`(음수 불가), `extracted_unit`, `confidence`(0~1).

## 3. 폴백 절차 (confidence < 0.8)

1. `agents/data-collector/src/confidence.ts`의 `decideBillStatus()`가
   confidence를 판정한다. `CONFIDENCE_THRESHOLD = 0.8` 미만이면
   `pending_review`.
2. `pending_review`가 되면 `utility_bills.status`가 그대로 `pending_review`로
   저장되고, `approvals` 테이블에 `low_confidence_ocr_confirm` 체크포인트로
   대기 레코드가 생긴다 (root CLAUDE.md 승인 게이트 ⑥).
3. 사람이 앱 UI에서 원본 이미지와 OCR 추출값을 나란히 보고, 값을 수정하거나
   그대로 확정한다. **에이전트가 재시도해서 confidence를 스스로 올리려
   하지 않는다** — 낮은 confidence는 이미지 품질/필체 문제일 가능성이 높아
   재시도로 해결되지 않는 경우가 많다.
4. 확정 후 `emission-engine`이 이 값을 사용해 `emission_records`를 계산한다.

## 4. 실패 시 체크리스트

- 이미지가 흐릿하거나 회전되어 있는가 → 사람에게 재촬영 요청
- 여러 페이지 청구서인데 한 페이지만 업로드됐는가 → 사용 기간이 청구서와
  다른지 `billing_period_start/end`로 확인
- `extract_bill_data` tool_use 블록 자체가 없다면(스키마 위반이 아니라
  Claude가 도구를 호출하지 않은 경우) `ocr-client.ts`가 예외를 던진다 —
  프롬프트가 도구 호출을 강제하는지(`tool_choice`) 먼저 점검한다.
