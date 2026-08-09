import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { RegulationFileSchema, type RegulationFile } from "./schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REGULATIONS_ROOT = join(__dirname, "..", "regulations");

export class RegulationNotApprovedError extends Error {}

/** Loads and validates a single regulation YAML file (e.g. "cbam", "cca", "csrd"). */
export function loadRegulation(
  regulationKey: string,
  root: string = REGULATIONS_ROOT
): RegulationFile {
  const filePath = join(root, `${regulationKey}.yaml`);
  const raw = parseYaml(readFileSync(filePath, "utf-8"));
  const parsed = RegulationFileSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid regulation file ${filePath}: ${parsed.error.message}`);
  }
  return parsed.data;
}

/** Like loadRegulation, but throws unless the regulation has been human-approved. */
export function loadApprovedRegulation(
  regulationKey: string,
  root: string = REGULATIONS_ROOT
): RegulationFile {
  const regulation = loadRegulation(regulationKey, root);
  if (regulation.status !== "approved") {
    throw new RegulationNotApprovedError(
      `Regulation "${regulationKey}" is still in "${regulation.status}" status and cannot be used ` +
        `until a human approves it (root CLAUDE.md 승인 게이트 ①).`
    );
  }
  return regulation;
}
