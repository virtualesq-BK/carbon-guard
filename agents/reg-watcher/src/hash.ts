import { createHash } from "node:crypto";

/** Deterministic content fingerprint used to detect whether a source page changed. */
export function computeContentHash(text: string): string {
  return createHash("sha256").update(text, "utf-8").digest("hex");
}

export function hasChanged(previousHash: string | null, newHash: string): boolean {
  return previousHash !== newHash;
}
