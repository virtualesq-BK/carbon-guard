import { describe, expect, it } from "vitest";
import { calculateEmission } from "../src/calculate.js";
import { UnitMismatchError } from "../src/unit.js";

const factor = {
  factor_key: "kr-nga/electricity",
  version: "2025-01",
  value: 0.4781,
  unit: "tCO2e/MWh",
  source: "https://example.test/source",
};

describe("calculateEmission", () => {
  it("multiplies activityQuantity by factor.value", () => {
    const result = calculateEmission({ activityQuantity: 100, activityUnit: "MWh", factor });
    expect(result.emissionValue).toBeCloseTo(47.81, 6);
    expect(result.emissionUnit).toBe("tCO2e");
    expect(result.factorKey).toBe("kr-nga/electricity");
    expect(result.factorVersion).toBe("2025-01");
  });

  it("returns 0 for a zero quantity", () => {
    const result = calculateEmission({ activityQuantity: 0, activityUnit: "MWh", factor });
    expect(result.emissionValue).toBe(0);
  });

  it("throws RangeError for a negative quantity", () => {
    expect(() =>
      calculateEmission({ activityQuantity: -1, activityUnit: "MWh", factor })
    ).toThrow(RangeError);
  });

  it("throws RangeError for a non-finite quantity", () => {
    expect(() =>
      calculateEmission({ activityQuantity: NaN, activityUnit: "MWh", factor })
    ).toThrow(RangeError);
  });

  it("throws UnitMismatchError when activityUnit doesn't match the factor", () => {
    expect(() =>
      calculateEmission({ activityQuantity: 10, activityUnit: "liter", factor })
    ).toThrow(UnitMismatchError);
  });

  it("is deterministic: same input always produces the same output", () => {
    const a = calculateEmission({ activityQuantity: 33.3, activityUnit: "MWh", factor });
    const b = calculateEmission({ activityQuantity: 33.3, activityUnit: "MWh", factor });
    expect(a).toEqual(b);
  });
});
