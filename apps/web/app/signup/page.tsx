"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    { type: "success"; message: string } | { type: "error"; message: string } | null
  >(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setStatus({ type: "error", message: error.message });
    } else if (data.session) {
      setStatus({ type: "success", message: "회원가입이 완료되었습니다." });
    } else {
      setStatus({
        type: "success",
        message: "확인 이메일을 보냈습니다. 메일함에서 링크를 눌러 가입을 완료해 주세요.",
      });
    }
    setLoading(false);
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← 홈으로
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">회원가입</h1>
      <p className="mt-2 text-sm text-slate-600">
        CarbonGuard 계정을 만들고 배출량 계산·보고서 작성을 시작하세요.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            이메일
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "가입 처리 중..." : "회원가입"}
        </button>
      </form>

      {status && (
        <p
          className={`mt-6 rounded-lg border p-4 text-sm ${
            status.type === "success"
              ? "border-brand-200 bg-brand-50 text-brand-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {status.message}
        </p>
      )}
    </main>
  );
}
