import type { BillExtraction } from "./schema.js";

export interface ApprovalInsert {
  checkpoint: "low_confidence_ocr_confirm";
  entity_type: "utility_bills";
  entity_id: string;
  company_id: string;
  requested_by: "data-collector";
  payload: BillExtraction;
  status: "pending";
}

/** Builds the approvals-table row for a low-confidence OCR extraction (checkpoint ⑥). */
export function buildApprovalPayload(
  billId: string,
  companyId: string,
  extraction: BillExtraction
): ApprovalInsert {
  return {
    checkpoint: "low_confidence_ocr_confirm",
    entity_type: "utility_bills",
    entity_id: billId,
    company_id: companyId,
    requested_by: "data-collector",
    payload: extraction,
    status: "pending",
  };
}
