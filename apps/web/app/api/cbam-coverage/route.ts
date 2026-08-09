import { NextRequest, NextResponse } from "next/server";
import { getCbamCoverage, checkCnCode } from "@/lib/coverage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cnCode = req.nextUrl.searchParams.get("cnCode");

  try {
    if (cnCode && cnCode.trim() !== "") {
      const result = checkCnCode(cnCode.trim());
      return NextResponse.json({ ok: true, mode: "check" as const, result });
    }
    const coverage = getCbamCoverage();
    return NextResponse.json({ ok: true, mode: "list" as const, coverage });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "coverage_unavailable",
        message: "CBAM 대상 품목 정보를 불러올 수 없습니다.",
      },
      { status: 503 }
    );
  }
}
