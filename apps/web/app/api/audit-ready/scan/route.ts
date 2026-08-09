import { NextResponse } from "next/server";
import { runAuditReadyScan } from "@/lib/audit-ready";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const scan = runAuditReadyScan();
    return NextResponse.json({ ok: true, ...scan });
  } catch {
    return NextResponse.json(
      { ok: false, error: "internal_error", message: "스캔 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
