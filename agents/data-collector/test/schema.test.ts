import { describe, expect, it } from "vitest";
import { BILL_EXTRACTION_TOOL, BillExtractionSchema } from "../src/schema.js";

const valid = {
  bill_type: "electricity" as const,
  billing_period_start: "2026-01-01",
  billing_period_end: "2026-01-31",
  extracted_quantity: 1234.5,
  extracted_unit: "kWh",
  confidence: 0.92,
};

describe("BillExtractionSchema", () => {
  it("accepts a well-formed extraction", () => {
    expect(BillExtractionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an unknown bill_type", () => {
    const result = BillExtractionSchema.safeParse({ ...valid, bill_type: "water" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative quantity", () => {
    const result = BillExtractionSchema.safeParse({ ...valid, extracted_quantity: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects confidence outside [0, 1]", () => {
    expect(BillExtractionSchema.safeParse({ ...valid, confidence: 1.5 }).success).toBe(false);
    expect(BillExtractionSchema.safeParse({ ...valid, confidence: -0.1 }).success).toBe(false);
  });

  it("rejects a period where start is after end", () => {
    const result = BillExtractionSchema.safeParse({
      ...valid,
      billing_period_start: "2026-02-01",
      billing_period_end: "2026-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects malformed dates", () => {
    expect(
      BillExtractionSchema.safeParse({ ...valid, billing_period_start: "01/01/2026" }).success
    ).toBe(false);
  });
});

describe("BILL_EXTRACTION_TOOL", () => {
  it("requires every field BillExtractionSchema requires", () => {
    const required = BILL_EXTRACTION_TOOL.input_schema.required;
    expect(required).toEqual([
      "bill_type",
      "billing_period_start",
      "billing_period_end",
      "extracted_quantity",
      "extracted_unit",
      "confidence",
    ]);
  });
});
