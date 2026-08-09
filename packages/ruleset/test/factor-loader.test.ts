import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  FactorNotFoundError,
  UnresolvedFactorError,
  loadAllFactors,
  resolveFactor,
} from "../src/factor-loader.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_ROOT = join(__dirname, "fixtures", "factors");

describe("loadAllFactors (fixtures)", () => {
  it("loads and validates every factor JSON under the given root", () => {
    const factors = loadAllFactors(FIXTURES_ROOT);
    expect(factors).toHaveLength(2);
    expect(factors.map((f) => f.version).sort()).toEqual(["2025-01", "2026-01"]);
  });
});

describe("resolveFactor (fixtures)", () => {
  it("resolves the version whose effective window covers the lookup date", () => {
    const factor = resolveFactor("test-system/foo", "2025-06-15", FIXTURES_ROOT);
    expect(factor.version).toBe("2025-01");
    expect(factor.value).toBe(1.111);
  });

  it("throws UnresolvedFactorError when the applicable version is still TODO", () => {
    expect(() => resolveFactor("test-system/foo", "2026-03-01", FIXTURES_ROOT)).toThrow(
      UnresolvedFactorError
    );
  });

  it("throws FactorNotFoundError for an unknown factor_key", () => {
    expect(() => resolveFactor("does-not-exist", "2025-06-15", FIXTURES_ROOT)).toThrow(
      FactorNotFoundError
    );
  });

  it("throws FactorNotFoundError when no version covers the lookup date", () => {
    expect(() => resolveFactor("test-system/foo", "2024-01-01", FIXTURES_ROOT)).toThrow(
      FactorNotFoundError
    );
  });
});

describe("resolveFactor (real ruleset factors)", () => {
  it("throws UnresolvedFactorError for the still-TODO kr-nga electricity factor", () => {
    expect(() => resolveFactor("kr-nga/electricity", "2026-06-01")).toThrow(
      UnresolvedFactorError
    );
  });
});
