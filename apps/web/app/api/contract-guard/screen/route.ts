import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { screenClauseText } from "@/lib/contract-guard-rules";

const RequestSchema = z.object({
  text: z.string().min(1).max(20_000),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_input", message: "검사할 계약 조항 텍스트를 입력해 주세요." },
      { status: 400 }
    );
  }

  const flags = screenClauseText(parsed.data.text);
  return NextResponse.json({ ok: true, flags });
}
