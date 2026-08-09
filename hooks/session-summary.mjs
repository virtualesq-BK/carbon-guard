#!/usr/bin/env node
// Stop hook: prints today's change summary + outstanding proposals. Only
// reads local files (logs/, packages/ruleset/proposals/) — it does not query
// Supabase, so "승인 대기열" for DB-backed approvals must be checked in the app.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const today = new Date().toISOString().slice(0, 10);
const todayLogDir = join(root, "logs", today);

let summary = `## 오늘(${today}) 세션 요약\n\n`;

if (existsSync(todayLogDir)) {
  const files = readdirSync(todayLogDir);
  summary += `### 오늘 기록된 로그\n`;
  for (const f of files) {
    summary += `- logs/${today}/${f}\n`;
  }
} else {
  summary += `오늘 기록된 로그가 없습니다.\n`;
}

const proposalsDir = join(root, "packages", "ruleset", "proposals");
if (existsSync(proposalsDir)) {
  const proposals = readdirSync(proposalsDir).filter(
    (f) => f.endsWith(".md") && f !== "README.md"
  );
  summary += `\n### 미반영 ruleset 제안 (packages/ruleset/proposals/)\n`;
  summary += proposals.length === 0 ? `- 없음\n` : proposals.map((p) => `- ${p} (사람 검토 대기)\n`).join("");
}

summary +=
  `\n### 승인 대기열 (approvals 테이블)\n` +
  `이 훅은 로컬 파일만 조회합니다 — Supabase approvals 테이블에서 ` +
  `status='pending'인 항목은 앱 UI 또는 \`select * from approvals where status='pending'\`로 직접 확인하세요.\n`;

process.stdout.write(summary);
process.exit(0);
