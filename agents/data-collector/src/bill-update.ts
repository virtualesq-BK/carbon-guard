import type { BillExtraction } from "./schema.js";
import type { BillReviewStatus } from "./confidence.js";

/** Shape of the row update applied to utility_bills after OCR. */
export interface UtilityBillUpdate {
  bill_type: BillExtraction["bill_type"];
  billing_period_start: string;
  billing_period_end: string;
  extracted_quantity: number;
  extracted_unit: string;
  ocr_confidence: number;
  ocr_raw: BillExtraction;
  status: BillReviewStatus;
}

export function buildUtilityBillUpdate(
  extraction: BillExtraction,
  status: BillReviewStatus
): UtilityBillUpdate {
  return {
    bill_type: extraction.bill_type,
    billing_period_start: extraction.billing_period_start,
    billing_period_end: extraction.billing_period_end,
    extracted_quantity: extraction.extracted_quantity,
    extracted_unit: extraction.extracted_unit,
    ocr_confidence: extraction.confidence,
    ocr_raw: extraction,
    status,
  };
}
