import { describe, expect, it } from "vitest";
import { buildUtilityBillUpdate } from "../src/bill-update.js";
import type { BillExtraction } from "../src/schema.js";

const extraction: BillExtraction = {
  bill_type: "electricity",
  billing_period_start: "2026-01-01",
  billing_period_end: "2026-01-31",
  extracted_quantity: 1000,
  extracted_unit: "kWh",
  confidence: 0.92,
};

describe("buildUtilityBillUpdate", () => {
  it("maps extraction fields into the utility_bills row shape", () => {
    const update = buildUtilityBillUpdate(extraction, "confirmed");
    expect(update).toEqual({
      bill_type: "electricity",
      billing_period_start: "2026-01-01",
      billing_period_end: "2026-01-31",
      extracted_quantity: 1000,
      extracted_unit: "kWh",
      ocr_confidence: 0.92,
      ocr_raw: extraction,
      status: "confirmed",
    });
  });

  it("carries pending_review status through unchanged", () => {
    const update = buildUtilityBillUpdate(extraction, "pending_review");
    expect(update.status).toBe("pending_review");
  });
});
