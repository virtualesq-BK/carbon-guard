#!/usr/bin/env node
// PreToolUse hook: blocks Write/Edit against packages/ruleset/{factors,regulations,changelog.md}
// and any .env* file. These must only ever be edited by a human (root CLAUDE.md
// 금지 행동 ①③④, 승인 게이트 ①). Exit code 2 tells Claude Code to block the
// tool call and shows stderr as the reason.
import { readFileSync } from "node:fs";

function readStdinJson() {
  try {
    return JSON.parse(readFileSync(0, "utf-8"));
  } catch {
    return {};
  }
}

const input = readStdinJson();
const toolName = input.tool_name ?? "";
const filePath = input.tool_input?.file_path ?? "";

const isGuardedRulesetPath = /packages[\\/]ruleset[\\/](factors|regulations)[\\/]/.test(filePath)
  || /packages[\\/]ruleset[\\/]changelog\.md$/.test(filePath);
const isEnvPath = /(^|[\\/])\.env(\..*)?$/.test(filePath) && !/\.env\.example$/.test(filePath);

if ((toolName === "Write" || toolName === "Edit") && (isGuardedRulesetPath || isEnvPath)) {
  process.stderr.write(
    `⛔ 차단됨: ${filePath}\n` +
      `packages/ruleset/(factors|regulations), changelog.md, .env*(.example 제외)는 하네스 훅이 직접 쓰기를 차단합니다.\n` +
      `- ruleset 변경은 reg-watcher의 제안(packages/ruleset/proposals/)을 사람이 검토한 뒤 직접 수정해야 합니다.\n` +
      `- .env*는 비밀값을 담고 있어 에이전트가 직접 쓰지 않습니다.\n`
  );
  process.exit(2);
}

process.exit(0);
