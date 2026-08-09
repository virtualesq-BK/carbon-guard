import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const STATE_ROOT = join(__dirname, "..", "state");

export interface SourceState {
  lastHash: string;
  lastCheckedAt: string;
}

function statePath(sourceKey: string, root: string): string {
  return join(root, `${sourceKey.replace(/\//g, "_")}.json`);
}

export function readSourceState(sourceKey: string, root: string = STATE_ROOT): SourceState | null {
  const path = statePath(sourceKey, root);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8")) as SourceState;
}

export function writeSourceState(
  sourceKey: string,
  state: SourceState,
  root: string = STATE_ROOT
): void {
  mkdirSync(root, { recursive: true });
  writeFileSync(statePath(sourceKey, root), JSON.stringify(state, null, 2));
}
