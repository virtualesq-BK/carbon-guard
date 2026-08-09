import { describe, expect, it } from "vitest";
import { CONFIDENCE_THRESHOLD, decideBillStatus } from "../src/confidence.js";

describe("decideBillStatus", () => {
  it("confirms at or above the threshold", () => {
    expect(decideBillStatus(CONFIDENCE_THRESHOLD)).toBe("confirmed");
    expect(decideBillStatus(0.95)).toBe("confirmed");
    expect(decideBillStatus(1)).toBe("confirmed");
  });

  it("falls back to pending_review below the threshold", () => {
    expect(decideBillStatus(0.79)).toBe("pending_review");
    expect(decideBillStatus(0)).toBe("pending_review");
  });

  it("throws RangeError outside [0, 1]", () => {
    expect(() => decideBillStatus(1.1)).toThrow(RangeError);
    expect(() => decideBillStatus(-0.1)).toThrow(RangeError);
    expect(() => decideBillStatus(NaN)).toThrow(RangeError);
  });
});
