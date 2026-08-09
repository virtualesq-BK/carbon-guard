import Anthropic from "@anthropic-ai/sdk";
import { BILL_EXTRACTION_TOOL, BillExtractionSchema, type BillExtraction } from "./schema.js";

const SYSTEM_PROMPT = `당신은 한국 중소 제조기업의 전력/연료 고지서를 판독하는 OCR 도우미입니다.
반드시 extract_bill_data 도구를 호출해 결과를 반환하세요.
읽을 수 없거나 불확실한 값을 절대 지어내지 마세요 — 불확실하면 최선의 추정치를 넣되
confidence를 낮게 설정하십시오. 확신이 없는 숫자를 자신 있게 보고하지 마십시오.`;

export interface OcrInput {
  imageBase64: string;
  mediaType: "image/png" | "image/jpeg" | "image/webp" | "application/pdf";
}

/**
 * Calls Claude Vision with a forced tool call so the response is always
 * structured JSON, then validates it against BillExtractionSchema.
 * Throws if Claude's output doesn't satisfy the schema — no silent fallback
 * to a fabricated value.
 */
export async function extractBillData(
  input: OcrInput,
  client: Anthropic = new Anthropic()
): Promise<BillExtraction> {
  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [BILL_EXTRACTION_TOOL],
    tool_choice: { type: "tool", name: BILL_EXTRACTION_TOOL.name },
    messages: [
      {
        role: "user",
        content: [
          {
            type: input.mediaType === "application/pdf" ? "document" : "image",
            source: {
              type: "base64",
              media_type: input.mediaType,
              data: input.imageBase64,
            },
          } as Anthropic.Messages.ImageBlockParam,
          { type: "text", text: "이 고지서에서 데이터를 추출하세요." },
        ],
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("Claude did not return a tool_use block for extract_bill_data");
  }

  const parsed = BillExtractionSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(`OCR output failed schema validation: ${parsed.error.message}`);
  }
  return parsed.data;
}
