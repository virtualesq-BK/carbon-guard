import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const RequestSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  companyName: z.string().max(200).optional(),
  message: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_input", message: "입력값을 다시 확인해 주세요." },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("contact_inquiries").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    company_name: parsed.data.companyName || null,
    message: parsed.data.message,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: "db_error", message: "문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
