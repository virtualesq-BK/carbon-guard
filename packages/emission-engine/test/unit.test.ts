import { describe, expect, it } from "vitest";
import { MalformedFactorUnitError, UnitMismatchError, assertUnitMatch, parseFactorUnit } from "../src/unit.js";

describe("parseFactorUnit", () => {
  it("splits emission/activity units", () => {
    expect(parseFactorUnit("tCO2e/MWh")).toEqual({ emissionUnit: "tCO2e", activityUnit: "MWh" });
  });

  it("throws MalformedFactorUnitError when there is no slash", () => {
    expect(() => parseFactorUnit("tCO2e")).toThrow(MalformedFactorUnitError);
  });

  it("throws MalformedFactorUnitError for extra slashes", () => {
    expect(() => parseFactorUnit("tCO2e/MWh/extra")).toThrow(MalformedFactorUnitError);
  });
});

describe("assertUnitMatch", () => {
  it("passes when activity units match", () => {
    expect(assertUnitMatch("tCO2e/MWh", "MWh")).toEqual({ emissionUnit: "tCO2e", activityUnit: "MWh" });
  });

  it("throws UnitMismatchError when activity units differ", () => {
    expect(() => assertUnitMatch("tCO2e/MWh", "liter")).toThrow(UnitMismatchError);
  });
});
