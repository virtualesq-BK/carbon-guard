import { NextResponse } from "next/server";
import { getScopeBoundaryGuide } from "@/lib/coverage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const guide = getScopeBoundaryGuide();
    return NextResponse.json({ ok: true, guide });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "guide_unavailable",
        message: "조직경계 판단 가이드를 불러올 수 없습니다.",
      },
      { status: 503 }
    );
  }
}
