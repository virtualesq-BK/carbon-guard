import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readSourceState, writeSourceState } from "../src/state-store.js";

let tmpRoot: string;

beforeEach(() => {
  tmpRoot = mkdtempSync(join(tmpdir(), "reg-watcher-state-"));
});

afterEach(() => {
  rmSync(tmpRoot, { recursive: true, force: true });
});

describe("state-store", () => {
  it("returns null for a source that has never been checked", () => {
    expect(readSourceState("factor__kr-nga_electricity__abc", tmpRoot)).toBeNull();
  });

  it("round-trips a written state", () => {
    writeSourceState(
      "factor__kr-nga_electricity__abc",
      { lastHash: "deadbeef", lastCheckedAt: "2026-07-22T00:00:00.000Z" },
      tmpRoot
    );
    expect(readSourceState("factor__kr-nga_electricity__abc", tmpRoot)).toEqual({
      lastHash: "deadbeef",
      lastCheckedAt: "2026-07-22T00:00:00.000Z",
    });
  });

  it("keeps state for different source ids separate", () => {
    writeSourceState("a", { lastHash: "1", lastCheckedAt: "t" }, tmpRoot);
    writeSourceState("b", { lastHash: "2", lastCheckedAt: "t" }, tmpRoot);
    expect(readSourceState("a", tmpRoot)?.lastHash).toBe("1");
    expect(readSourceState("b", tmpRoot)?.lastHash).toBe("2");
  });
});
