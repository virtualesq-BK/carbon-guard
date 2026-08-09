import { describe, expect, it } from "vitest";
import { FactorFileSchema, RegulationFileSchema } from "../src/schema.js";

describe("FactorFileSchema", () => {
  const base = {
    factor_key: "kr-nga/electricity",
    version: "2026-01",
    unit: "tCO2e/MWh",
    effective_from: "2026-01-01",
    effective_to: null,
  };

  it("accepts a TODO placeholder with empty source", () => {
    const result = FactorFileSchema.safeParse({ ...base, value: "TODO", source: "" });
    expect(result.success).toBe(true);
  });

  it("rejects a confirmed numeric value with empty source", () => {
    const result = FactorFileSchema.safeParse({ ...base, value: 0.4781, source: "" });
    expect(result.success).toBe(false);
  });

  it("accepts a confirmed numeric value with a source", () => {
    const result = FactorFileSchema.safeParse({
      ...base,
      value: 0.4781,
      source: "https://www.gir.go.kr/example",
    });
    expect(result.success).toBe(true);
  });

  it("rejects malformed effective_from", () => {
    const result = FactorFileSchema.safeParse({
      ...base,
      value: "TODO",
      source: "",
      effective_from: "2026/01/01",
    });
    expect(result.success).toBe(false);
  });
});

describe("RegulationFileSchema", () => {
  const base = {
    regulation_key: "cbam",
    jurisdiction: "EU",
    version: "TODO",
    effective_from: "TODO",
    status: "draft" as const,
  };

  it("accepts a draft regulation with empty source_url", () => {
    const result = RegulationFileSchema.safeParse({ ...base, source_url: "" });
    expect(result.success).toBe(true);
  });

  it("rejects an approved regulation with empty source_url", () => {
    const result = RegulationFileSchema.safeParse({
      ...base,
      status: "approved",
      source_url: "",
    });
    expect(result.success).toBe(false);
  });

  it("passes through regulation-specific extra fields", () => {
    const result = RegulationFileSchema.safeParse({
      ...base,
      source_url: "",
      covered_sectors: ["cement", "iron_and_steel"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).covered_sectors).toEqual(["cement", "iron_and_steel"]);
    }
  });
});
