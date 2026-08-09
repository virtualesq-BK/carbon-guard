import Link from "next/link";
import ContactForm from "@/components/ContactForm";

const steps = [
  {
    n: "01",
    title: "고지서 업로드",
    desc: "전력·연료 고지서 사진이나 PDF를 그대로 올리세요. OCR이 사용량과 기간을 자동으로 읽어냅니다.",
  },
  {
    n: "02",
    title: "배출량 자동 계산",
    desc: "국가별 공인 배출계수를 적용해 Scope 1·2 배출량을 결정론적으로 계산합니다. 계산 근거는 항상 추적 가능합니다.",
  },
  {
    n: "03",
    title: "보고서 초안 생성",
    desc: "CBAM XML, CCA 예측서, CSRD 보고서 초안을 자동으로 작성합니다. 제출 전 검증·승인 절차를 거칩니다.",
  },
];

const regulations = [
  {
    tag: "EU",
    name: "CBAM",
    desc: "탄소국경조정제도. 2026년 확정단계부터 철강·알루미늄·시멘트 등은 실측 배출량 신고가 원칙입니다. 철강 HRC 무상할당 벤치마크는 검증 중인 샘플 데이터로 미리 체험할 수 있습니다.",
  },
  {
    tag: "US",
    name: "CCA",
    desc: "미국 청정경쟁법 대응. 원자재·제품 단위 탄소집약도 예측서를 준비합니다.",
  },
  {
    tag: "EU",
    name: "CSRD",
    desc: "기업 지속가능성 보고 지침. ESG 공시 항목을 구조화된 보고서로 정리합니다.",
  },
];

const trustPoints = [
  "배출계수는 공인 출처만 사용 — 임의로 지어내지 않습니다",
  "모든 계산은 결정론적 함수로 실행되어 재현·감사가 가능합니다",
  "외부 제출용 문서는 사람이 검토·승인한 뒤에만 발행됩니다",
  "공식 확정치가 없는 값은 검증 중인 '샘플' 계수임을 결과 화면에 항상 표시합니다",
];

export default function HomePage() {
  return (
    <main>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight text-brand-700">
          CarbonGuard
        </span>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/audit-ready"
            className="hidden text-sm font-medium text-slate-600 hover:text-brand-700 sm:inline"
          >
            Audit-Ready
          </Link>
          <Link
            href="/contract-guard"
            className="hidden text-sm font-medium text-slate-600 hover:text-brand-700 sm:inline"
          >
            Contract Guard
          </Link>
          <Link
            href="/cbam-coverage"
            className="hidden text-sm font-medium text-slate-600 hover:text-brand-700 sm:inline"
          >
            CBAM 대상 확인
          </Link>
          <Link
            href="/scope-boundary"
            className="hidden text-sm font-medium text-slate-600 hover:text-brand-700 sm:inline"
          >
            조직경계 가이드
          </Link>
          <a
            href="#contact"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
          >
            도입 문의
          </a>
          <Link
            href="/signup"
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            회원가입
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-12 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            수출 중소 제조기업을 위한 AI 컴플라이언스
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            고지서 한 장으로
            <br />
            <span className="text-brand-600">탄소 컴플라이언스</span>를 끝내세요
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            법무·ESG 전담 인력 없이도 EU CBAM, 美 CCA, CSRD 보고서 초안을
            자동으로 준비합니다. 전력·연료 고지서만 올리면 배출량 계산부터
            제출 문서 작성까지 CarbonGuard가 처리합니다.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/demo"
              className="w-full rounded-lg bg-brand-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 sm:w-auto"
            >
              무료로 시작하기
            </Link>
            <a
              href="#how-it-works"
              className="w-full rounded-lg border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 sm:w-auto"
            >
              작동 방식 보기
            </a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            3단계로 끝나는 배출량 보고
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n} className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <span className="text-sm font-semibold text-brand-500">{step.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          어떤 규제를 대비하시나요
        </h2>
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {regulations.map((r) => (
            <div key={r.name} className="rounded-2xl border border-slate-200 p-6">
              <span className="inline-block rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                {r.tag}
              </span>
              <h3 className="mt-4 text-xl font-bold text-slate-900">{r.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            법적 분쟁을 예방하는 법률 리스크 도구
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-slate-600">
            뉴욕 변호사의 글로벌 규제 노하우를 반영한 사전 스크리닝 — 단, 법률 자문을
            대체하지 않으며 실제 계약·제출 전 반드시 전문가 검토가 필요합니다.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <Link
              href="/audit-ready"
              className="rounded-2xl border border-slate-200 p-6 transition hover:border-brand-500 hover:shadow-sm"
            >
              <h3 className="text-lg font-bold text-slate-900">Audit-Ready 사전 법률 검증</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                배출계수·규정 파일을 스캔해 유럽 제3자 실사·미국 CBP 심사에서
                지적받을 수 있는 미확정/미검증 항목을 미리 찾아냅니다.
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-brand-600">
                점검하러 가기 →
              </span>
            </Link>
            <Link
              href="/contract-guard"
              className="rounded-2xl border border-slate-200 p-6 transition hover:border-brand-500 hover:shadow-sm"
            >
              <h3 className="text-lg font-bold text-slate-900">Contract Guard</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                탄소 관련 표준 계약조항 라이브러리 제공, 해외 바이어의 일방적
                조항 AI 스크리닝, 해외 법률 전문가 연결까지.
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-brand-600">
                계약서 점검하러 가기 →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-brand-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-bold sm:text-3xl">신뢰할 수 있는 계산만 합니다</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustPoints.map((point) => (
              <li key={point} className="rounded-xl bg-white/5 p-5 text-sm leading-relaxed text-brand-50">
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          지금 CarbonGuard를 도입해 보세요
        </h2>
        <p className="mt-4 text-base text-slate-600">
          담당자가 귀사의 수출 품목과 규제 요건에 맞춰 도입 상담을 도와드립니다.
        </p>
        <ContactForm />
      </section>

      <footer className="border-t border-slate-100 py-10">
        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} CarbonGuard. AI 기반 공급망 탄소 컴플라이언스 SaaS.
        </p>
      </footer>
    </main>
  );
}
