import "server-only";
import { anthropic } from "./anthropic";

export type AiProvider = "anthropic" | "openai" | "universal";

export class AiGenerationError extends Error {
  constructor(
    message: string,
    public readonly anthropicError: unknown,
    public readonly openaiError: unknown,
    public readonly universalError: unknown
  ) {
    super(message);
  }
}

async function generateWithOpenAiFallback(prompt: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set — no fallback provider available.");
  }

  const res = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI-compatible endpoint returned ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string") {
    throw new Error("OpenAI-compatible response did not contain message content.");
  }
  return text;
}

/**
 * Third fallback: monogpt.kr's provider-agnostic "Universal" endpoint
 * (Universal_API/Universal_URL in .env). Assumed OpenAI-compatible
 * chat/completions shape, same as the monorouter's other provider routes —
 * confirm against actual gateway docs if this fails in practice.
 * The custom user-agent works around the same WAF block documented in
 * anthropic.ts (monogpt.kr's WAF 403s on default SDK/fetch user-agents).
 */
async function generateWithUniversalFallback(prompt: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.Universal_API;
  const baseURL = process.env.Universal_URL;
  const model = process.env.UNIVERSAL_MODEL || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
  if (!apiKey || !baseURL) {
    throw new Error("Universal_API/Universal_URL is not set — no universal fallback provider available.");
  }

  const url = baseURL.endsWith("/") ? `${baseURL}chat/completions` : `${baseURL}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
      "user-agent": "CarbonGuard/1.0",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Universal endpoint returned ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string") {
    throw new Error("Universal endpoint response did not contain message content.");
  }
  return text;
}

/**
 * Generates text via Anthropic first; if that call fails for any reason
 * (network, auth, rate limit, provider outage), falls back to the
 * OpenAI-compatible endpoint (OPENAI_API_KEY/OPENAI_BASE_URL), then to the
 * provider-agnostic Universal endpoint (Universal_API/Universal_URL).
 * Throws only if all three fail.
 */
export async function generateText(
  prompt: string,
  opts: { maxTokens?: number; model?: string } = {}
): Promise<{ text: string; provider: AiProvider }> {
  const maxTokens = opts.maxTokens ?? 1024;
  const model = opts.model || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });
    const block = response.content[0];
    if (block && block.type === "text") {
      return { text: block.text, provider: "anthropic" };
    }
    throw new Error("Anthropic response did not contain a text block.");
  } catch (anthropicError) {
    try {
      const text = await generateWithOpenAiFallback(prompt, maxTokens);
      return { text, provider: "openai" };
    } catch (openaiError) {
      try {
        const text = await generateWithUniversalFallback(prompt, maxTokens);
        return { text, provider: "universal" };
      } catch (universalError) {
        throw new AiGenerationError(
          "Anthropic, the OpenAI-compatible fallback, and the Universal fallback all failed to generate a response.",
          anthropicError,
          openaiError,
          universalError
        );
      }
    }
  }
}
