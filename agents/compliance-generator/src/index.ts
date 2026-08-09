export { buildCbamReport } from "./build-cbam-report.js";
export type { BuildCbamReportInput } from "./build-cbam-report.js";

export { buildCcaReport } from "./build-cca-report.js";
export type { BuildCcaReportInput } from "./build-cca-report.js";

export type { EmissionRecordInput, ReportInsert } from "./types.js";

export { formatLogEntry, logDatePath } from "./log.js";

export { generateNarrativeSummary } from "./narrative.js";

export { createServiceClient, insertReport, insertAgentLog } from "./store.js";
