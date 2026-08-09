export class UnitMismatchError extends Error {}
export class MalformedFactorUnitError extends Error {}

export interface ParsedFactorUnit {
  emissionUnit: string; // e.g. "tCO2e"
  activityUnit: string; // e.g. "MWh"
}

/**
 * Factor units are written as "<emissionUnit>/<activityUnit>", e.g. "tCO2e/MWh".
 * This is the only place unit strings are parsed — keeps the calculation in
 * calculate.ts free of string handling.
 */
export function parseFactorUnit(unit: string): ParsedFactorUnit {
  const parts = unit.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new MalformedFactorUnitError(
      `Factor unit "${unit}" must be of the form "<emissionUnit>/<activityUnit>" (e.g. "tCO2e/MWh")`
    );
  }
  return { emissionUnit: parts[0], activityUnit: parts[1] };
}

/** Throws UnitMismatchError unless activityUnit matches the factor's expected activity unit. */
export function assertUnitMatch(factorUnit: string, activityUnit: string): ParsedFactorUnit {
  const parsed = parseFactorUnit(factorUnit);
  if (parsed.activityUnit !== activityUnit) {
    throw new UnitMismatchError(
      `Activity unit "${activityUnit}" does not match factor's expected unit "${parsed.activityUnit}" ` +
        `(factor unit: "${factorUnit}")`
    );
  }
  return parsed;
}
