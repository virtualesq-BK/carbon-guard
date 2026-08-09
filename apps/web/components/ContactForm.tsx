"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", companyName: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    { type: "success"; message: string } | { type: "error"; message: string } | null
  >(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/contact-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus({ type: "success", message: "문의가 접수되었습니다. 담당자가 곧 연락드리겠습니다." });
        setForm({ name: "", email: "", companyName: "", message: "" });
      } else {
        setStatus({ type: "error", message: data.message || "문의 접수에 실패했습니다." });
      }
    } catch {
      setStatus({ type: "error", message: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          required
          placeholder="이름"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <input
          type="email"
          required
          placeholder="이메일"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <input
        type="text"
        placeholder="회사명 (선택)"
        value={form.companyName}
        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      <textarea
        required
        rows={4}
        placeholder="문의 내용 (수출 품목, 규제 요건 등)"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
      >
        {loading ? "전송 중..." : "도입 문의하기"}
      </button>

      {status && (
        <p
          className={`rounded-lg border p-3 text-sm ${
            status.type === "success"
              ? "border-brand-200 bg-brand-50 text-brand-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {status.message}
        </p>
      )}
    </form>
  );
}
