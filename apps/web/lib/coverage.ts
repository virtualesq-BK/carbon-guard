import "server-only";
import path from "node:path";
import { loadRegulation } from "ruleset";

// packages/ruleset bakes REGULATIONS_ROOT from import.meta.url at build time, which
// breaks on Vercel's build machine path. Pass the correct path explicitly, derived
// from process.cwd() at request time — same pattern as lib/audit-ready.ts.
const RULESET_DIR = path.join(process.cwd(), "..", "..", "packages", "ruleset");
const REGULATIONS_ROOT = path.join(RULESET_DIR, "regulations");

export interface CbamSector {
  key: string;
  cn_codes: string[];
  excluded_cn_codes?: string[];
  ghg: string[];
  note?: string;
  source?: string;
}

export interface CbamCoverage {
  status: "draft" | "approved";
  sourceUrl: string;
  sectors: CbamSector[];
  procedural: Record<string, unknown> | undefined;
}

/** Loads regulations/cbam.yaml and returns only the fields the UI needs. */
export function getCbamCoverage(): CbamCoverage {
  const reg = loadRegulation("cbam", REGULATIONS_ROOT) as unknown as {
    status: "draft" | "approved";
    source_url: string;
    covered_sectors: CbamSector[];
    procedural_requirements?: Record<string, unknown>;
  };
  return {
    status: reg.status,
    sourceUrl: reg.source_url,
    sectors: reg.covered_sectors ?? [],
    procedural: reg.procedural_requirements,
  };
}

/**
 * Checks whether a given CN code (4, 6, or 8 digits, spaces/dots ignored) falls
 * under a CBAM-covered sector. Matching is prefix-based against the heading-level
 * codes stored in cbam.yaml (e.g. "7601" matches "76011000"), and explicit
 * excluded_cn_codes always win over a broader covering heading (e.g. Chapter "72"
 * covering steel but "7204" being excluded).
 */
export function checkCnCode(rawInput: string): {
  input: string;
  normalized: string;
  covered: boolean;
  sector?: CbamSector;
  matchedCode?: string;
  excludedBy?: string;
} {
  const normalized = rawInput.replace(/[\s.\-]/g, "");
  const { sectors } = getCbamCoverage();

  for (const sector of sectors) {
    const excludeMatch = (sector.excluded_cn_codes ?? [])
      .map((c) => c.replace(/[\s.\-]/g, ""))
      .find((c) => normalized.startsWith(c) || c.startsWith(normalized));
    const codeMatch = sector.cn_codes
      .map((c) => c.replace(/^ex\s*/i, "").replace(/[\s.\-]/g, ""))
      .find((c) => normalized.startsWith(c) || c.startsWith(normalized));

    if (codeMatch) {
      if (excludeMatch) {
        return { input: rawInput, normalized, covered: false, sector, excludedBy: excludeMatch };
      }
      return { input: rawInput, normalized, covered: true, sector, matchedCode: codeMatch };
    }
  }
  return { input: rawInput, normalized, covered: false };
}

export interface BoundaryCase {
  case: string;
  financial_control?: string;
  operational_control?: string;
  note?: string;
}

export interface ScopeBoundaryGuide {
  status: "draft" | "approved";
  sourceUrl: string;
  principles: Record<string, string>;
  organizationalBoundary: {
    description: string;
    approaches: Record<string, unknown>;
    boundaryCasePatterns: BoundaryCase[];
  };
  scopes: Record<string, unknown>;
  activityDataMaturityTypes: Record<string, unknown>;
}

/** Loads regulations/ghg-protocol.yaml and returns only the fields the UI needs. */
export function getScopeBoundaryGuide(): ScopeBoundaryGuide {
  const reg = loadRegulation("ghg-protocol", REGULATIONS_ROOT) as unknown as {
    status: "draft" | "approved";
    source_url: string;
    accounting_principles: Record<string, string>;
    organizational_boundary: {
      description: string;
      approaches: Record<string, unknown>;
      boundary_case_patterns: BoundaryCase[];
    };
    operational_boundary: { scopes: Record<string, unknown> };
    activity_data_maturity_types: Record<string, unknown>;
  };
  return {
    status: reg.status,
    sourceUrl: reg.source_url,
    principles: reg.accounting_principles,
    organizationalBoundary: {
      description: reg.organizational_boundary.description,
      approaches: reg.organizational_boundary.approaches,
      boundaryCasePatterns: reg.organizational_boundary.boundary_case_patterns ?? [],
    },
    scopes: reg.operational_boundary.scopes,
    activityDataMaturityTypes: reg.activity_data_maturity_types,
  };
}
