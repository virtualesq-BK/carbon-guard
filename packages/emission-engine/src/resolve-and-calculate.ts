import { resolveFactor } from "ruleset";
import { calculateEmission, type EmissionCalculationResult } from "./calculate.js";

/**
 * Convenience wrapper: resolve the applicable factor version for factorKey/atDate
 * from packages/ruleset, then run the deterministic calculation. Still LLM-free —
 * resolveFactor only reads local versioned JSON files.
 */
export function resolveAndCalculateEmission(params: {
  factorKey: string;
  atDate: string | Date;
  activityQuantity: number;
  activityUnit: string;
  factorsRoot?: string;
}): EmissionCalculationResult {
  const factor = resolveFactor(params.factorKey, params.atDate, params.factorsRoot);

  if (typeof factor.value !== "number") {
    // Unreachable in practice: resolveFactor already throws UnresolvedFactorError
    // for TODO placeholders. Kept as a defensive type-narrowing check.
    throw new Error(`Resolved factor "${params.factorKey}" has a non-numeric value`);
  }

  return calculateEmission({
    activityQuantity: params.activityQuantity,
    activityUnit: params.activityUnit,
    factor: { ...factor, value: factor.value },
  });
}
