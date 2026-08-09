export { buildCbamXml, CbamXmlInputSchema, CbamEmissionLineSchema } from "./cbam-xml.js";
export type { CbamXmlInput } from "./cbam-xml.js";

export {
  simulateCcaTax,
  calculateInflationAdjustedRate,
  CCA_SIMULATION_CONFIG,
  CcaEstimateInputSchema,
} from "./cca-tax.js";
export type { CcaSimulationConfig, CcaEstimateInput, CcaEstimateResult } from "./cca-tax.js";
