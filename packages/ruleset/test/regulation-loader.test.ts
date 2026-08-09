import { describe, expect, it } from "vitest";
import {
  RegulationNotApprovedError,
  loadApprovedRegulation,
  loadRegulation,
} from "../src/regulation-loader.js";

describe("loadRegulation (real ruleset regulations)", () => {
  it("loads and validates the draft cbam.yaml placeholder", () => {
    const reg = loadRegulation("cbam");
    expect(reg.regulation_key).toBe("cbam");
    expect(reg.status).toBe("draft");
  });
});

describe("loadApprovedRegulation", () => {
  it("throws RegulationNotApprovedError while cbam is still draft", () => {
    expect(() => loadApprovedRegulation("cbam")).toThrow(RegulationNotApprovedError);
  });
});
