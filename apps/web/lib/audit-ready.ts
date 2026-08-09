import "server-only";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { loadRegulation } from "ruleset";

const RULESET_DIR = path.join(process.cwd(), "..", "..", "packages", "ruleset");
const FACTORS_ROOT = path.join(RULESET_DIR, "factors");
const SAMPLE_FACTORS_ROOT = path.join(RULESET_DIR, "factors(sample)");
const REGULATIONS_ROOT = path.join(RULESET_DIR, "regulations");

export type Severity = "high" | "medium" | "low";

export interface Finding {
  id: string;
  severity: Severity;
  category: "emission-factor" | "regulation-status" | "disclosure";
  title: string;
  detail: string;
  recommendation: string;
  sourceRef: string;
}

function walkJsonFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walkJsonFiles(full));
    } else if (entry.endsWith(".json")) {
      files.push(full);
    }
  }
  return files;
}

function extractVerificationTag(notes: string | undefined): string | null {
  if (!notes) return null;
  const match = notes.match(/verification:\s*([a-z0-9-]+)/i);
  return match ? match[1] : null;
}

function scanFactors(): Finding[] {
  const findings: Finding[] = [];

  for (const filePath of walkJsonFiles(FACTORS_ROOT)) {
    const rel = path.relative(RULESET_DIR, filePath).split(path.sep).join("/");
    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    if (data.value === "TODO") {
      findings.push({
        id: `official-todo:${data.factor_key}`,
        severity: "high",
        category: "emission-factor",
        title: `공식 배출계수 미확정: ${data.factor_key}`,
        detail:
          "packages/ruleset/factors(공식 source of truth)에 값이 아직 TODO로 남아 있습니다. " +
          "이 항목을 실제 보고서 산정에 사용하면, 유럽 제3자 검증기관 실사나 미국 CBP 심사에서 " +
          "\"근거 없는 수치 사용\"으로 지적받을 수 있는 취약점입니다.",
        recommendation: "reg-watcher 제안(packages/ruleset/proposals/)을 검토해 원문 대조 후 확정치를 채우세요.",
        sourceRef: rel,
      });
    }
  }

  for (const filePath of walkJsonFiles(SAMPLE_FACTORS_ROOT)) {
    const rel = path.relative(RULESET_DIR, filePath).split(path.sep).join("/");
    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    if (data.value === "TODO") continue; // already covered by official-side gap; sample TODO isn't independently reportable

    const tag = extractVerificationTag(data.notes);
    if (tag === "unverified-user-claim") {
      findings.push({
        id: `sample-unverified:${data.factor_key}`,
        severity: "medium",
        category: "emission-factor",
        title: `샘플 배출계수 — 1차 출처 미대조: ${data.factor_key}`,
        detail:
          "factors(sample)에만 존재하고 EU 공식 원문(EUR-Lex Official Journal) 등 1차 출처와의 " +
          "대조가 끝나지 않은 값입니다. 그대로 보고서에 쓰면 False Claims Act류(허위/근거 없는 " +
          "신고) 리스크 카테고리에 해당할 수 있습니다.",
        recommendation: "사람이 1차 공식 원문과 대조한 뒤 packages/ruleset/factors로 승격해야 합니다.",
        sourceRef: rel,
      });
    } else if (tag === "corroborated-secondary") {
      findings.push({
        id: `sample-corroborated:${data.factor_key}`,
        severity: "medium",
        category: "emission-factor",
        title: `샘플 배출계수 — 2차 출처만 확인됨: ${data.factor_key}`,
        detail:
          "독립된 2차 출처(업계 매체 등) 교차 확인은 되었으나, EU 공식 1차 원문(EUR-Lex Annex)은 " +
          "아직 대조되지 않았습니다.",
        recommendation: "제출 전 반드시 1차 원문(Official Journal)과 최종 대조하세요.",
        sourceRef: rel,
      });
    }
  }

  return findings;
}

function scanRegulations(): Finding[] {
  const findings: Finding[] = [];
  if (!existsSync(REGULATIONS_ROOT)) return findings;

  for (const entry of readdirSync(REGULATIONS_ROOT)) {
    if (!entry.endsWith(".yaml")) continue;
    const key = entry.replace(/\.yaml$/, "");
    try {
      const regulation = loadRegulation(key, REGULATIONS_ROOT);
      if (regulation.status !== "approved") {
        findings.push({
          id: `regulation-draft:${key}`,
          severity: "low",
          category: "regulation-status",
          title: `규정 파일 미승인 상태: ${key}`,
          detail: `packages/ruleset/regulations/${entry}의 status가 "draft"입니다. 승인 게이트 ①을 통과하지 않았습니다.`,
          recommendation: "사람이 검토·승인 후 status를 approved로 변경해야 이 규정을 근거로 제출 문서를 확정할 수 있습니다.",
          sourceRef: `regulations/${entry}`,
        });
      }
      if (!regulation.source_url || regulation.source_url.trim() === "") {
        findings.push({
          id: `regulation-no-source:${key}`,
          severity: "low",
          category: "regulation-status",
          title: `규정 근거 URL 없음: ${key}`,
          detail: `packages/ruleset/regulations/${entry}에 source_url이 비어 있습니다.`,
          recommendation: "공식 규정 원문 URL을 채워 추적 가능성을 확보하세요.",
          sourceRef: `regulations/${entry}`,
        });
      }
    } catch {
      // malformed regulation file — surface as a finding rather than crashing the scan
      findings.push({
        id: `regulation-invalid:${key}`,
        severity: "medium",
        category: "regulation-status",
        title: `규정 파일 파싱 실패: ${key}`,
        detail: `packages/ruleset/regulations/${entry}을 읽는 중 오류가 발생했습니다.`,
        recommendation: "파일 형식을 점검하세요.",
        sourceRef: `regulations/${entry}`,
      });
    }
  }

  return findings;
}

const SEVERITY_WEIGHT: Record<Severity, number> = { high: 15, medium: 6, low: 2 };

export function runAuditReadyScan(): { riskScore: number; findings: Finding[]; scannedAt: string } {
  const findings = [...scanFactors(), ...scanRegulations()];
  const penalty = findings.reduce((sum, f) => sum + SEVERITY_WEIGHT[f.severity], 0);
  const riskScore = Math.max(0, 100 - penalty);
  return { riskScore, findings, scannedAt: new Date().toISOString() };
}
