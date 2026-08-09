import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { FindingSchema, type Finding, type ReportForEvaluation } from "./schema.js";

// Intentionally a DIFFERENT system prompt/context from compliance-generator's
// narrative prompt (root CLAUDE.md: "compliance-evaluator는 compliance-generator와
// 별도 시스템 프롬프트·별도 컨텍스트로 실행"). This agent never sees the
// generator's reasoning — only the finished report content.
const SYSTEM_PROMPT = `당신은 CarbonGuard의 독립 컴플라이언스 검증관입니다.
아래 보고서 내용에서 다음을 찾아내세요: 근거 없이 확정적으로 표현된 주장,
과장되거나 오해를 부를 수 있는 문구, 규제기관이 문제 삼을 만한 서술(False Claims 위험).
계산이 맞는지는 이미 별도 로직으로 검증되었으니 신경 쓰지 마세요 — 서술/표현의
리스크에만 집중하세요. findings 배열로만 응답하세요.`;

const LlmFindingsSchema = z.object({ findings: z.array(FindingSchema) });

const FINDINGS_TOOL = {
  name: "report_findings",
  description: "Report narrative/False-Claims risk findings for this compliance report.",
  input_schema: {
    type: "object",
    properties: {
      findings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: { type: "string", enum: ["false_claims_risk"] },
            severity: { type: "string", enum: ["low", "medium", "high"] },
            message: { type: "string" },
          },
          required: ["category", "severity", "message"],
        },
      },
    },
    required: ["findings"],
  },
} as const;

/**
 * Narrative/False-Claims risk review via Claude, separate prompt/context from
 * the generator. Returns [] (never throws on empty) if Claude finds nothing.
 */
export async function checkReportNarrativeRisk(
  report: ReportForEvaluation,
  client: Anthropic = new Anthropic()
): Promise<Finding[]> {
  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [FINDINGS_TOOL],
    tool_choice: { type: "tool", name: FINDINGS_TOOL.name },
    messages: [
      {
        role: "user",
        content: `report_type: ${report.report_type}\ncontent:\n${JSON.stringify(report.content, null, 2)}`,
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) return [];

  const parsed = LlmFindingsSchema.safeParse(toolUse.input);
  return parsed.success ? parsed.data.findings : [];
}
