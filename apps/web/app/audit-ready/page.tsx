"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Severity = "high" | "medium" | "low";

type Finding = {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  detail: string;
  recommendation: string;
  sourceRef: string;
};

type ScanResponse =
  | { ok: true; riskScore: number; findings: Finding[]; scannedAt: string }
  | { ok: false; error: string; message: string };

const SEVERITY_LABEL: Record<Severity, string> = {
  high: "높음",
  medium: "중간",
  low: "낮음",
};

const SEVERITY_STYLE: Record<Severity, string> = {
  high: "bg-red-50 border-red-200 text-red-700",
  medium: "bg-amber-50 border-amber-200 text-amber-700",
  low: "bg-slate-50 border-slate-200 text-slate-600",
};

type ExplainState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; text: string }
  | { status: "error"; message: string };

export default function AuditReadyPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ScanResponse | null>(null);
  const [explain, setExplain] = useState<ExplainState>({ status: "idle" });

  useEffect(() => {
    fetch("/api/audit-ready/scan")
      .then((res) => res.json())
      .then((json: ScanResponse) => setData(json))
      .catch(() =>
        setData({ ok: false, error: "network_error", message: "스캔 서버에 연결할 수 없습니다." })
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleExplain() {
    if (!data || !data.ok) return;
    setExplain({ status: "loading" });
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "audit-findings",
          data: { riskScore: data.riskScore, findings: data.findings },
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setExplain({ status: "done", text: json.explanation });
      } else {
        setExplain({ status: "error", message: json.message });
      }
    } catch {
      setExplain({ status: "error", message: "설명 생성 서버에 연결할 수 없습니다." });
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← 홈으로
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">Audit-Ready 사전 법률 검증</h1>
      <p className="mt-3 text-slate-600">
        보고서에 실제로 쓰일 배출계수·규정 파일을 결정론적으로 스캔해, 유럽 제3자
        실사(verification)나 미국 관세청(CBP) 심사에서 지적받을 수 있는 근거 취약점을
        미리 찾아냅니다.
      </p>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        ⚠️ 이 도구는 <strong>법률 자문이 아닙니다.</strong> 배출계수·규정 파일의
        검증 상태(공식 확정 / 샘플 / 미확정)를 기계적으로 점검할 뿐이며, False Claims
        Act 등 특정 법령 위반 여부를 판단하지 않습니다. 실제 법적 판단은 반드시
        자격을 갖춘 변호사의 검토를 거쳐야 합니다.
      </div>

      {loading && <p className="mt-8 text-sm text-slate-500">스캔 중...</p>}

      {data && !data.ok && (
        <p className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {data.message}
        </p>
      )}

      {data && data.ok && (
        <>
          <div className="mt-8 flex items-center gap-6 rounded-2xl border border-slate-200 p-6">
            <div>
              <p className="text-sm text-slate-500">감사 대비 점수</p>
              <p
                className={`text-4xl font-bold ${
                  data.riskScore >= 80
                    ? "text-brand-600"
                    : data.riskScore >= 50
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {data.riskScore}
                <span className="text-lg text-slate-400">/100</span>
              </p>
            </div>
            <p className="text-sm text-slate-500">
              발견된 취약점 {data.findings.length}건 — 점수가 낮을수록 미확정/미검증
              항목이 많다는 뜻입니다.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExplain}
            disabled={explain.status === "loading"}
            className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700 disabled:opacity-60"
          >
            {explain.status === "loading" ? "설명 생성 중..." : "🪄 쉽게 설명해줘"}
          </button>

          {explain.status === "done" && (
            <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              {explain.text}
            </p>
          )}
          {explain.status === "error" && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {explain.message}
            </p>
          )}

          <div className="mt-8 space-y-4">
            {data.findings.length === 0 && (
              <p className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-700">
                현재 스캔 대상 파일 기준으로는 발견된 취약점이 없습니다.
              </p>
            )}
            {data.findings.map((f) => (
              <div key={f.id} className={`rounded-xl border p-5 ${SEVERITY_STYLE[f.severity]}`}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{f.title}</h3>
                  <span className="shrink-0 rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-semibold">
                    위험도 {SEVERITY_LABEL[f.severity]}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{f.detail}</p>
                <p className="mt-2 text-sm font-medium">권고: {f.recommendation}</p>
                <p className="mt-2 font-mono text-xs opacity-70">{f.sourceRef}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
