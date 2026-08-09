import { NextRequest, NextResponse } from "next/server";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { calculateEmission } from "emission-engine";
import { resolveAndCalculateEmission } from "emission-engine";
import { UnresolvedFactorError, FactorNotFoundError, FactorFileSchema } from "ruleset";
import { z } from "zod";

// packages/ruleset bakes its FACTORS_ROOT from import.meta.url at build time, which
// resolves to the build machine's path and breaks on Vercel (different runtime root).
// Pass the correct path explicitly, derived from process.cwd() at request time.
const RULESET_DIR = path.join(process.cwd(), "..", "..", "packages", "ruleset");
const FACTORS_ROOT = path.join(RULESET_DIR, "factors");
// factors(sample)/ is NOT the ruleset source of truth — see packages/ruleset/factors(sample)/README.md.
// It is only ever read here, from the demo API, never by emission-engine/ruleset directly.
const SAMPLE_FACTORS_ROOT = path.join(RULESET_DIR, "factors(sample)");

type CalcOption = {
  factorKey: string;
  activityUnit: string;
  /** Converts the raw user input (in inputUnitLabel) into activityUnit. */
  toActivityQuantity: (raw: number) => number;
};

const CALC_OPTIONS: Record<string, CalcOption> = {
  "kr-electricity": {
    factorKey: "kr-nga/electricity",
    activityUnit: "MWh",
    toActivityQuantity: (kwh) => kwh / 1000,
  },
  "cbam-steel-bf-bof": {
    factorKey: "cbam-benchmark-steel/hrc-bf-bof",
    activityUnit: "t",
    toActivityQuantity: (tonnes) => tonnes,
  },
  "cbam-steel-dri-eaf": {
    factorKey: "cbam-benchmark-steel/hrc-dri-eaf",
    activityUnit: "t",
    toActivityQuantity: (tonnes) => tonnes,
  },
  "cbam-steel-scrap-eaf": {
    factorKey: "cbam-benchmark-steel/hrc-scrap-eaf",
    activityUnit: "t",
    toActivityQuantity: (tonnes) => tonnes,
  },
  "cbam-steel-slab-china-default": {
    factorKey: "cbam-benchmark-steel/slab-china-default",
    activityUnit: "t",
    toActivityQuantity: (tonnes) => tonnes,
  },
  "cbam-pfc-cf4": {
    factorKey: "cbam-scope1-process/pfc-cf4-gwp",
    activityUnit: "t",
    toActivityQuantity: (tonnes) => tonnes,
  },
  "cbam-pfc-c2f6": {
    factorKey: "cbam-scope1-process/pfc-c2f6-gwp",
    activityUnit: "t",
    toActivityQuantity: (tonnes) => tonnes,
  },
};

const RequestSchema = z.object({
  calcId: z.enum([
    "kr-electricity",
    "cbam-steel-bf-bof",
    "cbam-steel-dri-eaf",
    "cbam-steel-scrap-eaf",
    "cbam-steel-slab-china-default",
    "cbam-pfc-cf4",
    "cbam-pfc-c2f6",
  ]),
  quantity: z.number().positive().max(10_000_000),
});

function walkJsonFiles(dir: string): string[] {
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

/**
 * Looks up a numeric (non-TODO) factor from factors(sample)/. Returns null if the
 * sample factor for this key doesn't exist or is itself still "TODO" — never
 * fabricates a fallback number (root CLAUDE.md 금지 행동 ①).
 */
function resolveSampleFactor(factorKey: string) {
  const candidates: Array<{ factor_key: string; value: number | "TODO"; unit: string; source: string; version: string; effective_from: string; effective_to: string | null }> = [];
  for (const filePath of walkJsonFiles(SAMPLE_FACTORS_ROOT)) {
    const parsed = FactorFileSchema.safeParse(JSON.parse(readFileSync(filePath, "utf-8")));
    if (parsed.success && parsed.data.factor_key === factorKey && parsed.data.value !== "TODO") {
      candidates.push(parsed.data);
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => (a.effective_from < b.effective_from ? 1 : -1));
  return candidates[0];
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_input", message: "입력값을 올바르게 입력해 주세요." },
      { status: 400 }
    );
  }

  const option = CALC_OPTIONS[parsed.data.calcId];
  const activityQuantity = option.toActivityQuantity(parsed.data.quantity);

  try {
    const result = resolveAndCalculateEmission({
      factorKey: option.factorKey,
      atDate: new Date(),
      activityQuantity,
      activityUnit: option.activityUnit,
      factorsRoot: FACTORS_ROOT,
    });

    return NextResponse.json({ ok: true, sample: false, result });
  } catch (err) {
    if (err instanceof UnresolvedFactorError || err instanceof FactorNotFoundError) {
      const sampleFactor = resolveSampleFactor(option.factorKey);
      if (sampleFactor && typeof sampleFactor.value === "number") {
        const result = calculateEmission({
          activityQuantity,
          activityUnit: option.activityUnit,
          factor: { ...sampleFactor, value: sampleFactor.value },
        });
        return NextResponse.json({
          ok: true,
          sample: true,
          message:
            "이 결과값은 아직 공식 확정치가 반영되지 않은 샘플 배출계수를 적용했습니다.",
          result,
        });
      }

      if (err instanceof UnresolvedFactorError) {
        return NextResponse.json({
          ok: false,
          error: "unresolved_factor",
          message:
            "이 배출계수는 아직 공식 확정치가 반영되지 않았습니다. reg-watcher가 출처와 함께 제안하고 사람이 검토·승인해야 계산에 사용됩니다 — 확인되지 않은 숫자는 임의로 채우지 않습니다.",
        });
      }
      return NextResponse.json({
        ok: false,
        error: "factor_not_found",
        message: "해당 활동에 적용 가능한 배출계수를 찾을 수 없습니다.",
      });
    }
    return NextResponse.json(
      { ok: false, error: "internal_error", message: "계산 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
