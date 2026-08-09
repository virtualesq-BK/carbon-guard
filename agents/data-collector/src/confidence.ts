// Threshold below which an OCR extraction must fall back to human review
// instead of auto-confirming. See root CLAUDE.md 승인 게이트 ⑥.
export const CONFIDENCE_THRESHOLD = 0.8;

export type BillReviewStatus = "confirmed" | "pending_review";

export function decideBillStatus(confidence: number): BillReviewStatus {
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    throw new RangeError(`confidence must be a number in [0, 1], got ${confidence}`);
  }
  return confidence >= CONFIDENCE_THRESHOLD ? "confirmed" : "pending_review";
}
