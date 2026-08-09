import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { UnresolvedFactorError } from "ruleset";
import { describe, expect, it } from "vitest";
import { resolveAndCalculateEmission } from "../src/resolve-and-calculate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_ROOT = join(__dirname, "fixtures", "factors");

describe("resolveAndCalculateEmission (fixtures)", () => {
  it("resolves the factor for the given date and calculates deterministically", () => {
    const result = resolveAndCalculateEmission({
      factorKey: "test-system/foo",
      atDate: "2025-06-15",
      activityQuantity: 10,
      activityUnit: "MWh",
      factorsRoot: FIXTURES_ROOT,
    });
    expect(result.emissionValue).toBeCloseTo(5, 6);
    expect(result.factorVersion).toBe("2025-01");
  });
});

describe("resolveAndCalculateEmission (real ruleset factors)", () => {
  it("propagates UnresolvedFactorError for the still-TODO kr-nga electricity factor", () => {
    expect(() =>
      resolveAndCalculateEmission({
        factorKey: "kr-nga/electricity",
        atDate: "2026-06-01",
        activityQuantity: 10,
        activityUnit: "MWh",
      })
    ).toThrow(UnresolvedFactorError);
  });
});
