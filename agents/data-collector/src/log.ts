import type { BillExtraction } from "./schema.js";
import type { BillReviewStatus } from "./confidence.js";

/**
 * Formats a log entry matching the format specified in
 * agents/data-collector/CLAUDE.md, appended to logs/YYYY-MM-DD/data-collector.md.
 */
export function formatLogEntry(
  billId: string,
  extraction: BillExtraction,
  status: BillReviewStatus,
  now: Date = new Date()
): string {
  const processed = status === "confirmed" ? "auto_confirmed" : "pending_review";
  return [
    `## ${now.toISOString()} — utility_bill_id: ${billId}`,
    `- confidence: ${extraction.confidence.toFixed(2)}`,
    `- 추출값: ${extraction.extracted_quantity} ${extraction.extracted_unit}`,
    `- 처리: ${processed}`,
    "",
  ].join("\n");
}

export function logDatePath(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10); // YYYY-MM-DD
}
