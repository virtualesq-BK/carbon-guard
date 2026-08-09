import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai";
import { buildEmissionResultPrompt, buildAuditFindingsPrompt } from "@/lib/explain";

export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  kind: z.enum(["emission-result", "audit-findings"]),
  data: z.unknown(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_input", message: "설명할 데이터가 없습니다." },
      { status: 400 }
    );
  }

  const prompt =
    parsed.data.kind === "emission-result"
      ? buildEmissionResultPrompt(parsed.data.data)
      : buildAuditFindingsPrompt(parsed.data.data);

  try {
    const { text, provider } = await generateText(prompt, { maxTokens: 400 });
    return NextResponse.json({ ok: true, explanation: text, provider });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "ai_unavailable",
        message: "지금은 설명을 생성할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 503 }
    );
  }
}
