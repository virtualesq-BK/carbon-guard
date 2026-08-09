import { describe, expect, it } from "vitest";
import { sumEmissions, sumEmissionsByScope } from "../src/aggregate.js";

describe("sumEmissions", () => {
  it("sums emissionValue across records", () => {
    expect(sumEmissions([{ emissionValue: 1.5 }, { emissionValue: 2.5 }])).toBe(4);
  });

  it("returns 0 for an empty list", () => {
    expect(sumEmissions([])).toBe(0);
  });
});

describe("sumEmissionsByScope", () => {
  it("buckets totals by scope, defaulting missing scopes to 0", () => {
    const totals = sumEmissionsByScope([
      { scope: "scope1", emissionValue: 10 },
      { scope: "scope2", emissionValue: 5 },
      { scope: "scope2", emissionValue: 3 },
    ]);
    expect(totals).toEqual({ scope1: 10, scope2: 8, scope3: 0 });
  });
});
