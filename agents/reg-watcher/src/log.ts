import type { Source } from "./sources.js";

export function formatLogEntry(
  source: Source,
  reasoning: string,
  proposalFilePath: string,
  now: Date = new Date()
): string {
  return [
    `## ${now.toISOString()}`,
    `- 감지 항목: ${source.key}`,
    `- 출처 URL: ${source.url}`,
    `- 판단 근거: ${reasoning}`,
    `- 제안 파일: ${proposalFilePath}`,
    "",
  ].join("\n");
}

export function formatNoChangeLogEntry(source: Source, now: Date = new Date()): string {
  return [
    `## ${now.toISOString()}`,
    `- 감지 항목: ${source.key}`,
    `- 출처 URL: ${source.url}`,
    `- 판단 근거: 변경 없음 (해시 동일)`,
    `- 제안 파일: (없음)`,
    "",
  ].join("\n");
}

export function formatSkippedUnverifiedLogEntry(source: Source, now: Date = new Date()): string {
  return [
    `## ${now.toISOString()}`,
    `- 감지 항목: ${source.key}`,
    `- 출처 URL: ${source.url}`,
    `- 판단 근거: sources.yaml에서 verified: false — 사람이 URL을 확인하기 전까지 조회하지 않음`,
    `- 제안 파일: (없음)`,
    "",
  ].join("\n");
}

export function logDatePath(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}
