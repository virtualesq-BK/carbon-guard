"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BoundaryCase {
  case: string;
  financial_control?: string;
  operational_control?: string;
  note?: string;
}

interface ScopeBoundaryGuide {
  status: "draft" | "approved";
  sourceUrl: string;
  principles: Record<string, string>;
  organizationalBoundary: {
    description: string;
    boundaryCasePatterns: BoundaryCase[];
  };
  activityDataMaturityTypes: Record<
    string,
    { accuracy: string; unit: string; method: string; guidance?: string }
  >;
}

type GuideState =
  | { status: "loading" }
  | { status: "done"; guide: ScopeBoundaryGuide }
  | { status: "error"; message: string };

const CONTROL_STYLE: Record<string, string> = {
  포함: "text-brand-700 bg-brand-50",
  제외: "text-slate-500 bg-slate-100",
};

function ControlBadge({ label }: { label?: string }) {
  if (!label) return <span className="text-xs text-slate-400">—</span>;
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
        CONTROL_STYLE[label] ?? "text-slate-600 bg-slate-100"
      }`}
    >
      {label}
    </span>
  );
}

export default function ScopeBoundaryPage() {
  const [state, setState] = useState<GuideState>({ status: "loading" });

  useEffect(() => {
    fetch("/api/scope-boundary")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setState({ status: "done", guide: data.guide });
        else setState({ status: "error", message: data.message });
      })
      .catch(() => setState({ status: "error", message: "서버에 연결할 수 없습니다." }));
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← 홈으로
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">조직경계 설정 가이드</h1>
      <p className="mt-3 text-slate-600">
        우리 회사의 어느 사업장·자회사·리스자산을 배출량 보고 범위에 포함해야 할지
        판단하는 기준입니다. GHG Protocol Corporate Standard와, 기후에너지환경부·
        한국환경산업기술원이 2026년 2월 발간한 국내 기업 사례집을 근거로 합니다.
        배출계수 수치는 포함하지 않은 방법론 참고자료입니다.
      </p>

      {state.status === "loading" && <p className="mt-8 text-sm text-slate-500">불러오는 중...</p>}
      {state.status === "error" && <p className="mt-8 text-sm text-red-700">{state.message}</p>}

      {state.status === "done" && (
        <>
          {state.guide.status !== "approved" && (
            <p className="mt-6 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              ⚠️ 이 참고자료는 아직 사람의 최종 승인(status: approved)을 받지 않았습니다.
            </p>
          )}

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-slate-900">1. 온실가스 산정 5대 원칙</h2>
            <dl className="mt-4 space-y-2">
              {Object.entries(state.guide.principles).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-slate-200 bg-white p-4">
                  <dd className="text-sm text-slate-700">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-slate-900">2. 조직경계 접근법</h2>
            <p className="mt-2 text-sm text-slate-600">
              {state.guide.organizationalBoundary.description}
            </p>
            <p className="mt-4 text-sm font-medium text-slate-700">
              실제 판단 사례 — 재무통제/운영통제 적용 결과
            </p>
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">사례</th>
                    <th className="px-4 py-3">재무통제</th>
                    <th className="px-4 py-3">운영통제</th>
                  </tr>
                </thead>
                <tbody>
                  {state.guide.organizationalBoundary.boundaryCasePatterns.map((c, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 align-top text-slate-800">
                        {c.case}
                        {c.note && (
                          <p className="mt-1 text-xs text-slate-500">{c.note}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <ControlBadge label={c.financial_control} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <ControlBadge label={c.operational_control} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-semibold text-slate-900">
              3. 활동자료 확보 수준별 산정 방식
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              데이터 성숙도가 낮은 SME도 참고할 수 있도록, 확보 가능한 데이터 수준에
              맞춰 세 단계로 나눈 접근법입니다. 가능하면 Type 1·2를 우선 사용하고,
              Type 3은 물리적 계측이 어려운 경우의 보조 수단입니다.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {Object.entries(state.guide.activityDataMaturityTypes)
                .filter(([key]) => key.startsWith("type_"))
                .map(([key, t]) => (
                  <div key={key} className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase text-brand-600">
                      {key.replace("type_", "Type ")}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      정확도: {t.accuracy}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">{t.unit}</p>
                    <p className="mt-1 text-xs text-slate-500">{t.method}</p>
                  </div>
                ))}
            </div>
          </section>

          <p className="mt-10 text-xs text-slate-400">
            출처:{" "}
            <a
              href={state.guide.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-brand-600"
            >
              {state.guide.sourceUrl}
            </a>
          </p>
        </>
      )}
    </main>
  );
}
