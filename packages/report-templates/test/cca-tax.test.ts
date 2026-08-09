import { describe, expect, it } from "vitest";
import {
  CCA_SIMULATION_CONFIG,
  calculateInflationAdjustedRate,
  simulateCcaTax,
} from "../src/cca-tax.js";

describe("calculateInflationAdjustedRate", () => {
  it("returns the base rate in the base year", () => {
    expect(calculateInflationAdjustedRate(CCA_SIMULATION_CONFIG, 2025)).toBe(55);
  });

  it("compounds inflation year over year", () => {
    const rate2027 = calculateInflationAdjustedRate(CCA_SIMULATION_CONFIG, 2027);
    expect(rate2027).toBeCloseTo(55 * 1.025 ** 2, 6);
  });

  it("throws RangeError for a year before baseYear", () => {
    expect(() => calculateInflationAdjustedRate(CCA_SIMULATION_CONFIG, 2020)).toThrow(RangeError);
  });
});

describe("simulateCcaTax", () => {
  it("multiplies taxable margin by the inflation-adjusted rate", () => {
    const result = simulateCcaTax({ carbonIntensityMarginTons: 100, year: 2025 });
    expect(result.ratePerTonUsd).toBe(55);
    expect(result.estimatedTaxUsd).toBe(5500);
    expect(result.isSimulation).toBe(true);
  });

  it("applies inflation for future years", () => {
    const result = simulateCcaTax({ carbonIntensityMarginTons: 100, year: 2026 });
    expect(result.ratePerTonUsd).toBeCloseTo(55 * 1.025, 6);
    expect(result.estimatedTaxUsd).toBeCloseTo(100 * 55 * 1.025, 6);
  });

  it("always includes an assumption disclaimer", () => {
    const result = simulateCcaTax({ carbonIntensityMarginTons: 10, year: 2025 });
    expect(result.assumptionNote).toMatch(/SIMULATION ONLY/);
  });

  it("throws on a negative margin", () => {
    expect(() => simulateCcaTax({ carbonIntensityMarginTons: -1, year: 2025 })).toThrow();
  });

  it("is deterministic", () => {
    const a = simulateCcaTax({ carbonIntensityMarginTons: 42, year: 2030 });
    const b = simulateCcaTax({ carbonIntensityMarginTons: 42, year: 2030 });
    expect(a).toEqual(b);
  });
});
