"use client";

import { useState } from "react";
import Link from "next/link";
import { CLAUSE_LIBRARY } from "@/lib/contract-guard-rules";

type Severity = "high" | "medium" | "low";

type ClauseFlag = {
  patternId: string;
  label: string;
  severity: Severity;
  explanation: string;
  matchedKeyword: string;
  clauseCategoryId: string;
};

type ScreenResponse =
  | { ok: true; flags: ClauseFlag[] }
  | { ok: false; error: string; message: string };

const SEVERITY_LABEL: Record<Severity, string> = { high: "높음", medium: "중간", low: "낮음" };
const SEVERITY_STYLE: Record<Severity, string> = {
  high: "bg-red-50 border-red-200 text-red-700",
  medium: "bg-amber-50 border-amber-200 text-amber-700",
  low: "bg-slate-50 border-slate-200 text-slate-600",
};

export default function ContractGuardPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ScreenResponse | null>(null);

  async function handleScreen(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch("/api/contract-guard/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as ScreenResponse;
      setResponse(data);
    } catch {
      setResponse({ ok: false, error: "network_error", message: "서버에 연결할 수 없습니다." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← 홈으로
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">Contract Guard</h1>
      <p className="mt-3 text-slate-600">
        해외 바이어가 보낸 공급계약의 탄소 관련 조항이 일방적인지 키워드 기반으로
        스크리닝하고, 표준 조항 라이브러리와 대조해 봅니다.
      </p>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        ⚠️ 이 스크리닝은 <strong>법률 자문이 아닙니다.</strong> 미리 정의한 키워드
        패턴과 일치하는지만 기계적으로 검사하며, 조항의 법적 유효성·집행 가능성을
        판단하지 않습니다. 실제 계약 검토는 아래 "해외 법률 전문가 연결"을 통해
        자격을 갖춘 변호사에게 반드시 확인하세요.
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">표준 계약조항 라이브러리</h2>
        <p className="mt-1 text-sm text-slate-500">
          출처: <code className="text-xs">sop/carbon-contract-clauses-reference.md</code> (비공식 참고자료)
        </p>
        <div className="mt-6 space-y-4">
          {CLAUSE_LIBRARY.map((c) => (
            <details key={c.id} className="rounded-xl border border-slate-200 p-5">
              <summary className="cursor-pointer font-semibold text-slate-900">{c.title}</summary>
              <p className="mt-2 text-sm text-slate-600">{c.summary}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {c.keyPoints.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-slate-900">계약 조항 AI 스크리닝</h2>
        <p className="mt-1 text-sm text-slate-600">
          바이어가 보낸 계약서에서 탄소 관련 조항 부분을 붙여넣으세요.
        </p>
        <form onSubmit={handleScreen} className="mt-4 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="예: The Supplier shall be liable for all damages without limitation arising from any emissions data error..."
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={loading || text.trim().length === 0}
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "검사 중..." : "조항 스크리닝하기"}
          </button>
        </form>

        {response && (
          <div className="mt-6">
            {response.ok ? (
              response.flags.length === 0 ? (
                <p className="rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-700">
                  등록된 독소조항 패턴과 일치하는 부분을 찾지 못했습니다. (패턴에 없는
                  위험까지 놓치지 않으려면 반드시 법률 전문가 검토를 받으세요.)
                </p>
              ) : (
                <div className="space-y-3">
                  {response.flags.map((f) => (
                    <div key={f.patternId} className={`rounded-xl border p-4 ${SEVERITY_STYLE[f.severity]}`}>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold">{f.label}</h3>
                        <span className="shrink-0 rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-semibold">
                          위험도 {SEVERITY_LABEL[f.severity]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed">{f.explanation}</p>
                      <p className="mt-2 text-xs opacity-70">일치 키워드: “{f.matchedKeyword}”</p>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {response.message}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="mt-12 rounded-2xl bg-brand-900 p-8 text-center text-white">
        <h2 className="text-xl font-bold">해외 법률 전문가 연결</h2>
        <p className="mt-2 text-sm text-brand-50">
          스크리닝 결과와 계약서를 함께 보내주시면, 담당자가 관할 국가의 통상·CBAM
          전문 변호사 연결을 도와드립니다.
        </p>
        <a
          href="mailto:hello@carbonguard.app?subject=Contract%20Guard%20-%20해외%20법률%20전문가%20연결%20요청"
          className="mt-6 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
        >
          전문가 연결 요청 보내기
        </a>
      </section>
    </main>
  );
}
