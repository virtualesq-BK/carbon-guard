import { assertUnitMatch } from "./unit.js";

export interface EmissionFactorInput {
  factor_key: string;
  version: string;
  value: number;
  unit: string; // "<emissionUnit>/<activityUnit>", e.g. "tCO2e/MWh"
  source: string;
}

export interface EmissionCalculationResult {
  emissionValue: number;
  emissionUnit: string;
  activityQuantity: number;
  activityUnit: string;
  factorKey: string;
  factorVersion: string;
  factorSource: string;
}

/**
 * Deterministic emission calculation: activityQuantity × factor.value.
 * No network calls, no LLM calls — see root CLAUDE.md 금지 행동 ②.
 */
export function calculateEmission(input: {
  activityQuantity: number;
  activityUnit: string;
  factor: EmissionFactorInput;
}): EmissionCalculationResult {
  if (!Number.isFinite(input.activityQuantity) || input.activityQuantity < 0) {
    throw new RangeError(
      `activityQuantity must be a non-negative finite number, got ${input.activityQuantity}`
    );
  }

  const { emissionUnit } = assertUnitMatch(input.factor.unit, input.activityUnit);

  return {
    emissionValue: input.activityQuantity * input.factor.value,
    emissionUnit,
    activityQuantity: input.activityQuantity,
    activityUnit: input.activityUnit,
    factorKey: input.factor.factor_key,
    factorVersion: input.factor.version,
    factorSource: input.factor.source,
  };
}
