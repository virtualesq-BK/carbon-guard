import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다");

/**
 * Structured OCR output for a single utility bill. `confidence` is the model's
 * own self-assessment; it does not guarantee correctness, but a low value is
 * the signal that routes the bill to human review (see confidence.ts).
 */
export const BillExtractionSchema = z
  .object({
    bill_type: z.enum(["electricity", "gas", "fuel", "steam", "other"]),
    billing_period_start: isoDate,
    billing_period_end: isoDate,
    extracted_quantity: z.number().nonnegative(),
    extracted_unit: z.string().min(1),
    confidence: z.number().min(0).max(1),
  })
  .refine((f) => f.billing_period_start <= f.billing_period_end, {
    message: "billing_period_start must not be after billing_period_end",
    path: ["billing_period_end"],
  });

export type BillExtraction = z.infer<typeof BillExtractionSchema>;

/**
 * Anthropic tool-use input schema mirroring BillExtractionSchema, used to force
 * Claude Vision to respond with structured JSON instead of free text.
 */
export const BILL_EXTRACTION_TOOL = {
  name: "extract_bill_data",
  description:
    "Extract structured data from a utility bill image or PDF page. Never invent a " +
    "precise number you cannot actually read from the document — if a field is unclear " +
    "or illegible, provide your best estimate but set confidence low accordingly.",
  input_schema: {
    type: "object",
    properties: {
      bill_type: {
        type: "string",
        enum: ["electricity", "gas", "fuel", "steam", "other"],
      },
      billing_period_start: { type: "string", description: "YYYY-MM-DD" },
      billing_period_end: { type: "string", description: "YYYY-MM-DD" },
      extracted_quantity: { type: "number", description: "usage quantity for the period" },
      extracted_unit: { type: "string", description: "e.g. kWh, MWh, m3, L" },
      confidence: {
        type: "number",
        description: "self-assessed confidence in this extraction, from 0.0 to 1.0",
      },
    },
    required: [
      "bill_type",
      "billing_period_start",
      "billing_period_end",
      "extracted_quantity",
      "extracted_unit",
      "confidence",
    ],
  },
} as const;
