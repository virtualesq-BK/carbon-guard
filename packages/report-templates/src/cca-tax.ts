import { z } from "zod";

/**
 * ⚠️ SIMULATION ASSUMPTION — the US Clean Competition Act (CCA) is not enacted
 * law. These values are a commonly cited public-policy baseline used for
 * illustrative estimates only, NOT a confirmed regulatory figure. They are
 * intentionally kept separate from packages/ruleset/regulations/cca.yaml's
 * `tax_model` (which stays TODO until reg-watcher + human approval confirm an
 * actual enacted rate). See cca.yaml's `simulation_assumptions` block — this
 * constant must be kept in sync with it and only changed together with a
 * changelog.md entry there.
 */
export const CCA_SIMULATION_CONFIG = {
  baseRateUsdPerTon: 55,
  baseYear: 2025,
  annualInflationRate: 0.025,
} as const;

export type CcaSimulationConfig = typeof CCA_SIMULATION_CONFIG;

export const CcaEstimateInputSchema = z.object({
  carbonIntensityMarginTons: z.number().nonnegative(),
  year: z.number().int(),
});

export type CcaEstimateInput = z.infer<typeof CcaEstimateInputSchema>;

export interface CcaEstimateResult {
  taxableMarginTons: number;
  ratePerTonUsd: number;
  estimatedTaxUsd: number;
  year: number;
  isSimulation: true;
  assumptionNote: string;
}

/** Compound-inflates the base rate from baseYear to `year`. Pure, deterministic. */
export function calculateInflationAdjustedRate(
  config: CcaSimulationConfig,
  year: number
): number {
  if (year < config.baseYear) {
    throw new RangeError(`year (${year}) must be >= baseYear (${config.baseYear})`);
  }
  const yearsElapsed = year - config.baseYear;
  return config.baseRateUsdPerTon * Math.pow(1 + config.annualInflationRate, yearsElapsed);
}

/**
 * CCA tax simulator: 탄소집약도 마진(taxable margin, tCO2e) × 톤당 세율(인플레 연동).
 * This is a SIMULATION for planning purposes — never presented to the user as
 * an official tax liability. compliance-generator must label output accordingly.
 */
export function simulateCcaTax(
  rawInput: CcaEstimateInput,
  config: CcaSimulationConfig = CCA_SIMULATION_CONFIG
): CcaEstimateResult {
  const input = CcaEstimateInputSchema.parse(rawInput);
  const ratePerTonUsd = calculateInflationAdjustedRate(config, input.year);

  return {
    taxableMarginTons: input.carbonIntensityMarginTons,
    ratePerTonUsd,
    estimatedTaxUsd: input.carbonIntensityMarginTons * ratePerTonUsd,
    year: input.year,
    isSimulation: true,
    assumptionNote:
      `SIMULATION ONLY — based on an illustrative $${config.baseRateUsdPerTon}/ton ` +
      `(${config.baseYear}) baseline + ${(config.annualInflationRate * 100).toFixed(1)}%/yr ` +
      `inflation assumption. CCA is not yet enacted law; see packages/ruleset/regulations/cca.yaml.`,
  };
}
