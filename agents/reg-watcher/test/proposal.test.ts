import { describe, expect, it } from "vitest";
import { buildProposalMarkdown, proposalFileName } from "../src/proposal.js";
import type { Source } from "../src/sources.js";

const source: Source = {
  key: "kr-nga/electricity",
  kind: "factor",
  url: "https://www.gir.go.kr",
  description: "GIR 배출계수",
  verified: true,
};

const fixedDate = new Date("2026-07-22T03:04:05.000Z");

describe("buildProposalMarkdown", () => {
  it("marks the proposal as requiring human review, never auto-applied", () => {
    const md = buildProposalMarkdown({
      source,
      previousHash: "abc123",
      newHash: "def456",
      fetchedAt: fixedDate,
    });
    expect(md).toContain("사람 검토 필요");
    expect(md).toContain(source.url);
    expect(md).toContain("kr-nga/electricity");
  });

  it("labels a null previousHash as a first-time check", () => {
    const md = buildProposalMarkdown({ source, previousHash: null, newHash: "def456", fetchedAt: fixedDate });
    expect(md).toContain("최초 조회");
  });

  it("points factor proposals at packages/ruleset/factors/", () => {
    const md = buildProposalMarkdown({ source, previousHash: null, newHash: "x", fetchedAt: fixedDate });
    expect(md).toContain("packages/ruleset/factors/");
  });

  it("points regulation proposals at packages/ruleset/regulations/", () => {
    const regSource: Source = { ...source, kind: "regulation" };
    const md = buildProposalMarkdown({ source: regSource, previousHash: null, newHash: "x", fetchedAt: fixedDate });
    expect(md).toContain("packages/ruleset/regulations/");
  });
});

describe("proposalFileName", () => {
  it("combines date and a slash-safe key", () => {
    expect(proposalFileName(source, fixedDate)).toBe("2026-07-22-kr-nga_electricity.md");
  });
});
