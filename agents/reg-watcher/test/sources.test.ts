import { describe, expect, it } from "vitest";
import { loadSources, sourceId, verifiedSourcesOnly } from "../src/sources.js";

describe("loadSources (real sources.yaml)", () => {
  it("loads and validates every entry", () => {
    const sources = loadSources();
    expect(sources.length).toBeGreaterThan(0);
    for (const s of sources) {
      expect(s.key.length).toBeGreaterThan(0);
      expect(["factor", "regulation"]).toContain(s.kind);
    }
  });

  it("every source currently starts unverified (no un-confirmed URL is auto-trusted)", () => {
    const sources = loadSources();
    expect(verifiedSourcesOnly(sources)).toEqual([]);
  });
});

describe("sourceId", () => {
  it("differentiates two sources that share the same key but different URLs", () => {
    const a = sourceId({
      key: "cbam",
      kind: "regulation" as const,
      url: "https://example.test/a",
      description: "",
      verified: false,
    });
    const b = sourceId({
      key: "cbam",
      kind: "regulation" as const,
      url: "https://example.test/b",
      description: "",
      verified: false,
    });
    expect(a).not.toBe(b);
  });

  it("is deterministic", () => {
    const source = {
      key: "cbam",
      kind: "regulation" as const,
      url: "https://example.test/a",
      description: "",
      verified: false,
    };
    expect(sourceId(source)).toBe(sourceId(source));
  });
});
