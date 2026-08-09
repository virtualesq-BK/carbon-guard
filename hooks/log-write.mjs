#!/usr/bin/env node
// PostToolUse hook: appends every file write (Write/Edit/NotebookEdit) to
// logs/YYYY-MM-DD/file-writes.md — timestamp, file, tool.
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function readStdinJson() {
  try {
    return JSON.parse(readFileSync(0, "utf-8"));
  } catch {
    return {};
  }
}

const WRITE_TOOLS = new Set(["Write", "Edit", "NotebookEdit"]);

const input = readStdinJson();
const toolName = input.tool_name ?? "unknown";
if (!WRITE_TOOLS.has(toolName)) process.exit(0);

const filePath = input.tool_input?.file_path ?? "(unknown)";
const __dirname = dirname(fileURLToPath(import.meta.url));
const logsRoot = join(__dirname, "..", "logs");
const now = new Date();
const today = now.toISOString().slice(0, 10);
const dir = join(logsRoot, today);

mkdirSync(dir, { recursive: true });
appendFileSync(join(dir, "file-writes.md"), `- ${now.toISOString()} — ${toolName} → ${filePath}\n`);

process.exit(0);
