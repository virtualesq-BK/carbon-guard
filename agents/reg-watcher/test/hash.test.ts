import { describe, expect, it } from "vitest";
import { computeContentHash, hasChanged } from "../src/hash.js";

describe("computeContentHash", () => {
  it("is deterministic for the same input", () => {
    expect(computeContentHash("hello")).toBe(computeContentHash("hello"));
  });

  it("differs for different input", () => {
    expect(computeContentHash("hello")).not.toBe(computeContentHash("hello!"));
  });
});

describe("hasChanged", () => {
  it("is true when there is no previous hash", () => {
    expect(hasChanged(null, computeContentHash("x"))).toBe(true);
  });

  it("is false when hashes match", () => {
    const h = computeContentHash("same content");
    expect(hasChanged(h, h)).toBe(false);
  });

  it("is true when hashes differ", () => {
    expect(hasChanged(computeContentHash("a"), computeContentHash("b"))).toBe(true);
  });
});
