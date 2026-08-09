export { calculateEmission } from "./calculate.js";
export type { EmissionFactorInput, EmissionCalculationResult } from "./calculate.js";

export { parseFactorUnit, assertUnitMatch, UnitMismatchError, MalformedFactorUnitError } from "./unit.js";
export type { ParsedFactorUnit } from "./unit.js";

export { sumEmissions, sumEmissionsByScope } from "./aggregate.js";
export type { EmissionScope, ScopedEmission } from "./aggregate.js";

export { resolveAndCalculateEmission } from "./resolve-and-calculate.js";
