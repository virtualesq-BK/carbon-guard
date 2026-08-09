"use client";

import { useState } from "react";
import Link from "next/link";

type CalcId =
  | "kr-electricity"
  | "cbam-steel-bf-bof"
  | "cbam-steel-dri-eaf"
  | "cbam-steel-scrap-eaf"
  | "cbam-steel-slab-china-default"
  | "cbam-pfc-cf4"
  | "cbam-pfc-c2f6";

const CALC_OPTIONS: Array<{
  id: CalcId;
  label: string;
  inputLabel: string;
  inputUnit: string;
  defaultValue: string;
}> = [
  {
    id: "kr-electricity",
    label: "한국 전력 사용량 (Scope 2, 국내 배출계수)",
    inputLabel: "월간 전력 사용량",
    inputUnit: "kWh",
    defaultValue: "1000",
  },
  {
    id: "cbam-steel-bf-bof",
    label: "CBAM 철강 HRC — BF/BOF 경로 (샘플 벤치마크)",
    inputLabel: "열연코일(HRC) 생산량",
    inputUnit: "t",
    defaultValue: "100",
  },
  {
    id: "cbam-steel-dri-eaf",
    label: "CBAM 철강 HRC — DRI/EAF 경로 (샘플 벤치마크)",
    inputLabel: "열연코일(HRC) 생산량",
    inputUnit: "t",
    defaultValue: "100",
  },
  {
    id: "cbam-steel-scrap-eaf",
    label: "CBAM 철강 HRC — 스크랩 기반 EAF 경로 (샘플 벤치마크)",
    inputLabel: "열연코일(HRC) 생산량",
    inputUnit: "t",
    defaultValue: "100",
  },
  {
    id: "cbam-steel-slab-china-default",
    label: "CBAM 철강 슬라브 — 중국산 기본값 (샘플, 실측 미제출 시 적용)",
    inputLabel: "철강 슬라브 수입량",
    inputUnit: "t",
    defaultValue: "100",
  },
  {
    id: "cbam-pfc-cf4",
    label: "CBAM 알루미늄 PFC — CF4 배출량 (샘플, IPCC AR5 GWP)",
    inputLabel: "CF4 배출량",
    inputUnit: "t",
    defaultValue: "1",
  },
  {
    id: "cbam-pfc-c2f6",
    label: "CBAM 알루미늄 PFC — C2F6 배출량 (샘플, IPCC AR5 GWP)",
    inputLabel: "C2F6 배출량",
    inputUnit: "t",
    defaultValue: "1",
  },
];

type CalcResult = {
  emissionValue: number;
  emissionUnit: string;
  activityQuantity: number;
  activityUnit: string;
  factorKey: string;
  factorVersion: string;
  factorSource: string;
};

type ApiResponse =
  | { ok: true; sample: boolean; message?: string; result: CalcResult }
  | { ok: false; error: string; message: string };

type ExplainState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; text: string }
  | { status: "error"; message: string };

export default function DemoPage() {
  const [calcId, setCalcId] = useState<CalcId>("kr-electricity");
  const [quantity, setQuantity] = useState(CALC_OPTIONS[0].defaultValue);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [explain, setExplain] = useState<ExplainState>({ status: "idle" });

  const selected = CALC_OPTIONS.find((o) => o.id === calcId)!;

  function handleCalcChange(id: CalcId) {
    setCalcId(id);
    setQuantity(CALC_OPTIONS.find((o) => o.id === id)!.defaultValue);
    setResponse(null);
    setExplain({ status: "idle" });
  }

  async function handleExplain() {
    if (!response || !response.ok) return;
    setExplain({ status: "loading" });
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "emission-result", data: response }),
      });
      const data = await res.json();
      if (data.ok) {
        setExplain({ status: "done", text: data.explanation });
      } else {
        setExplain({ status: "error", message: data.message });
      }
    } catch {
      setExplain({ status: "error", message: "설명 생성 서버에 연결할 수 없습니다." });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setExplain({ status: "idle" });
    try {
      const res = await fetch("/api/demo/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calcId, quantity: Number(quantity) }),
      });
      const data = (await res.json()) as ApiResponse;
      setResponse(data);
    } catch {
      setResponse({
        ok: false,
        error: "network_error",
        message: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← 홈으로
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">배출량 계산 체험하기</h1>
      <p className="mt-3 text-slate-600">
        CarbonGuard의 배출량 계산 엔진이 실제 계산 로직을 그대로 실행합니다.
        배출계수 값은 절대 지어내지 않으며, 공식 확정치가 없는 항목은 아직
        검증 중인 샘플 계수를 쓰는지, 그마저 없는지를 항상 밝힙니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="calc" className="block text-sm font-medium text-slate-700">
            계산 항목
          </label>
          <select
            id="calc"
            value={calcId}
            onChange={(e) => handleCalcChange(e.target.value as CalcId)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {CALC_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">
            {selected.inputLabel} ({selected.inputUnit})
          </label>
          <input
            id="quantity"
            type="number"
            min="0"
            step="any"
            required
            value={quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuantity(e.target.value)
            }
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "계산 중..." : "배출량 계산하기"}
        </button>
      </form>

      {response && (
        <div
          className={`mt-8 rounded-xl border p-5 ${
            response.ok
              ? response.sample
                ? "border-amber-300 bg-amber-50"
                : "border-brand-200 bg-brand-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          {response.ok ? (
            <>
              {response.sample && (
                <p className="mb-3 rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800">
                  ⚠️ {response.message}
                </p>
              )}
              <p
                className={`text-sm font-semibold ${
                  response.sample ? "text-amber-700" : "text-brand-700"
                }`}
              >
                계산 결과
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {response.result.emissionValue.toFixed(4)} {response.result.emissionUnit}
              </p>
              <dl className="mt-4 space-y-1 text-sm text-slate-600">
                <div className="flex justify-between">
                  <dt>활동량</dt>
                  <dd>
                    {response.result.activityQuantity} {response.result.activityUnit}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>배출계수</dt>
                  <dd>
                    {response.result.factorKey} ({response.result.factorVersion})
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>출처</dt>
                  <dd className="max-w-xs text-right">{response.result.factorSource || "—"}</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={handleExplain}
                disabled={explain.status === "loading"}
                className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700 disabled:opacity-60"
              >
                {explain.status === "loading" ? "설명 생성 중..." : "🪄 쉽게 설명해줘"}
              </button>

              {explain.status === "done" && (
                <p className="mt-3 rounded-lg bg-white/70 p-4 text-sm leading-relaxed text-slate-700">
                  {explain.text}
                </p>
              )}
              {explain.status === "error" && (
                <p className="mt-3 rounded-lg bg-white/70 p-4 text-sm text-red-700">
                  {explain.message}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-amber-700">계산할 수 없습니다</p>
              <p className="mt-2 text-sm leading-relaxed text-amber-900">{response.message}</p>
            </>
          )}
        </div>
      )}
    </main>
  );
}
