import type { ReportInsert } from "./types.js";

export function formatLogEntry(
  reportId: string,
  reportType: ReportInsert["report_type"],
  usedEmissionRecordIds: string[],
  usedRulesetVersions: string[],
  now: Date = new Date()
): string {
  return [
    `## ${now.toISOString()} — report_id: ${reportId}`,
    `- report_type: ${reportType}`,
    `- 사용된 emission_records: [${usedEmissionRecordIds.join(", ")}]`,
    `- 사용된 ruleset 버전: ${usedRulesetVersions.join(", ")}`,
    "",
  ].join("\n");
}

export function logDatePath(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}
