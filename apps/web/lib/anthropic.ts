import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Server-side only. Never import this file from a client component —
// the "server-only" import will throw a build error if that happens.
// defaultHeaders overrides the SDK's own "Anthropic/JS x.x.x" User-Agent — the
// monogpt.kr proxy's WAF blocks any request whose User-Agent contains
// "Anthropic" with a 403, confirmed by testing raw fetch calls directly.
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
  defaultHeaders: {
    "user-agent": "CarbonGuard/1.0",
  },
});
