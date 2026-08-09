"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CbamSector {
  key: string;
  cn_codes: string[];
  excluded_cn_codes?: string[];
  ghg: string[];
  note?: string;
  source?: string;
}

interface CbamCoverage {
  status: "draft" | "approved";
  sourceUrl: string;
  sectors: CbamSector[];
  procedural?: Record<string, unknown>;
}

interface CheckResult {
  input: string;
  normalized: string;
  covered: boolean;
  sector?: CbamSector;
  matchedCode?: string;
  excludedBy?: string;
}

const SECTOR_LABEL: Record<string, string> = {
  aluminium: "알루미늄",
  iron_and_steel: "철강",
  cement: "시멘트",
  fertilisers: "비료",
  hydrogen: "수소",
  electricity: "전력",
};

const GHG_LABEL: Record<string, string> = {
  carbon_dioxide: "CO2",
  perfluorocarbons: "PFCs",
  nitrous_oxide: "N2O",
};

type ListState =
  | { status: "loading" }
  | { status: "done"; coverage: CbamCoverage }
  | { status: "error"; message: string };

type CheckState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: CheckResult }
  | { status: "error"; message: string };

export default function CbamCoveragePage() {
  const [list, setList] = useState<ListState>({ status: "loading" });
  const [cnCode, setCnCode] = useState("");
  const [check, setCheck] = useState<CheckState>({ status: "idle" });

  useEffect(() => {
    fetch("/api/cbam-coverage")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setList({ status: "done", coverage: data.coverage });
        else setList({ status: "error", message: data.message });
      })
      .catch(() => setList({ status: "error", message: "서버에 연결할 수 없습니다." }));
  }, []);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!cnCode.trim()) return;
    setCheck({ status: "loading" });
    try {
      const res = await fetch(`/api/cbam-coverage?cnCode=${encodeURIComponent(cnCode.trim())}`);
      const data = await res.json();
      if (data.ok) setCheck({ status: "done", result: data.result });
      else setCheck({ status: "error", message: data.message });
    } catch {
      setCheck({ status: "error", message: "서버에 연결할 수 없습니다." });
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← 홈으로
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">CBAM 대상 품목(CN코드) 확인</h1>
      <p className="mt-3 text-slate-600">
        수출 품목의 CN코드가 EU CBAM 대상인지 확인합니다. 아래 목록은 EUR-Lex
        원문(Regulation (EU) 2023/956 Annex I, 2025-10-20 기준 통합본)과 직접
        대조하여 검증했습니다. 배출계수·기본값 등 수치는 아직 확정치가 아니므로
        이 화면에는 포함하지 않습니다.
      </p>

      <form onSubmit={handleCheck} className="mt-8 flex gap-2">
        <input
          type="text"
          placeholder="예: 76011000 또는 7601"
          value={cnCode}
          onChange={(e) => setCnCode(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={check.status === "loading"}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
        >
          {check.status === "loading" ? "확인 중..." : "확인"}
        </button>
      </form>

      {check.status === "done" && (
        <div
          className={`mt-4 rounded-xl border p-5 ${
            check.result.covered
              ? "border-brand-200 bg-brand-50"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          {check.result.covered ? (
            <>
              <p className="text-sm font-semibold text-brand-700">✅ CBAM 대상입니다</p>
              <p className="mt-1 text-sm text-slate-700">
                부문: <strong>{SECTOR_LABEL[check.result.sector!.key] ?? check.result.sector!.key}</strong>{" "}
                (매칭 CN코드: {check.result.matchedCode})
              </p>
              <p className="mt-1 text-sm text-slate-600">
                대상 온실가스:{" "}
                {check.result.sector!.ghg.map((g) => GHG_LABEL[g] ?? g).join(", ")}
              </p>
              {check.result.sector!.note && (
                <p className="mt-2 rounded-lg bg-white/70 p-3 text-xs text-slate-600">
                  {check.result.sector!.note}
                </p>
              )}
            </>
          ) : check.result.excludedBy ? (
            <>
              <p className="text-sm font-semibold text-amber-700">⚠️ 제외 대상입니다</p>
              <p className="mt-1 text-sm text-slate-700">
                {SECTOR_LABEL[check.result.sector!.key] ?? check.result.sector!.key} 부문의 상위
                헤딩과는 일치하지만, CN코드 {check.result.excludedBy}는 Annex I에서 명시적으로
                제외됩니다.
              </p>
            </>
          ) : (
            <p className="text-sm font-semibold text-slate-600">
              대상 부문을 찾지 못했습니다. CBAM 6대 부문(철강·알루미늄·시멘트·비료·전력·수소)
              CN코드 목록이 아니거나, 입력이 정확한지 확인해 주세요.
            </p>
          )}
        </div>
      )}
      {check.status === "error" && (
        <p className="mt-4 text-sm text-red-700">{check.message}</p>
      )}

      <h2 className="mt-12 text-lg font-semibold text-slate-900">부문별 CN코드 전체 목록</h2>

      {list.status === "loading" && <p className="mt-4 text-sm text-slate-500">불러오는 중...</p>}
      {list.status === "error" && <p className="mt-4 text-sm text-red-700">{list.message}</p>}
      {list.status === "done" && (
        <>
          {list.coverage.status !== "approved" && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              ⚠️ 이 규정 파일은 아직 사람의 최종 승인(status: approved)을 받지 않았습니다.
              CN코드는 EUR-Lex 원문 대조를 마쳤으나, 절차·수치 항목 일부는 여전히 검토 중입니다.
            </p>
          )}
          <div className="mt-4 space-y-4">
            {list.coverage.sectors.map((sector) => (
              <div
                key={sector.key}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">
                    {SECTOR_LABEL[sector.key] ?? sector.key}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {sector.ghg.map((g) => GHG_LABEL[g] ?? g).join(" + ")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {sector.cn_codes.join(", ")}
                </p>
                {sector.excluded_cn_codes && sector.excluded_cn_codes.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    제외: {sector.excluded_cn_codes.join(", ")}
                  </p>
                )}
                {sector.note && (
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{sector.note}</p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-400">
            출처:{" "}
            <a
              href={list.coverage.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-brand-600"
            >
              {list.coverage.sourceUrl}
            </a>
          </p>
        </>
      )}
    </main>
  );
}
