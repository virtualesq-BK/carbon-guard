import { describe, expect, it } from "vitest";
import { buildApprovalPayload } from "../src/approval.js";
import type { BillExtraction } from "../src/schema.js";

const extraction: BillExtraction = {
  bill_type: "gas",
  billing_period_start: "2026-02-01",
  billing_period_end: "2026-02-28",
  extracted_quantity: 55.2,
  extracted_unit: "m3",
  confidence: 0.4,
};

describe("buildApprovalPayload", () => {
  it("builds a pending low_confidence_ocr_confirm approval row", () => {
    const approval = buildApprovalPayload("bill-1", "company-1", extraction);
    expect(approval).toEqual({
      checkpoint: "low_confidence_ocr_confirm",
      entity_type: "utility_bills",
      entity_id: "bill-1",
      company_id: "company-1",
      requested_by: "data-collector",
      payload: extraction,
      status: "pending",
    });
  });
});
