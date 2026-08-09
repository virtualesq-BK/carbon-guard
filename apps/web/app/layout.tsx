import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CarbonGuard — 수출 중소기업을 위한 탄소 컴플라이언스 AI",
  description:
    "전력·연료 고지서를 올리면 배출량을 자동 계산하고 EU CBAM · 美 CCA · CSRD 보고서 초안을 만들어 드립니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
