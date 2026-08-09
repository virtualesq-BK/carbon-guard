import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `당신은 CarbonGuard의 보고서 서술 문구 작성 도우미입니다.
숫자는 절대 직접 계산하거나 수정하지 마세요 — 주어진 수치를 그대로 인용해
비전문가 고객이 이해하기 쉬운 한국어 요약 문장만 작성하세요.`;

/**
 * Generates plain-language narrative text for a report. Only ever called with
 * already-computed numbers to describe — never used to produce the numbers
 * themselves (those come from emission-engine / report-templates).
 */
export async function generateNarrativeSummary(
  facts: Record<string, unknown>,
  client: Anthropic = new Anthropic()
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `다음 수치를 바탕으로 2~3문장 요약을 작성하세요:\n${JSON.stringify(facts, null, 2)}`,
      },
    ],
  });

  const textBlock = message.content.find(
    (block): block is Anthropic.Messages.TextBlock => block.type === "text"
  );
  return textBlock?.text ?? "";
}
