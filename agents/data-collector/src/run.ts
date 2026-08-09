#!/usr/bin/env tsx
// CLI entry: processes one utility bill through OCR → schema validation →
// confidence-gated confirm/pending_review → DB write → log append.
// Usage: tsx src/run.ts --bill-id <id> --company-id <id> --file <path-to-image>
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildApprovalPayload } from "./approval.js";
import { buildUtilityBillUpdate } from "./bill-update.js";
import { decideBillStatus } from "./confidence.js";
import { formatLogEntry, logDatePath } from "./log.js";
import { extractBillData, type OcrInput } from "./ocr-client.js";
import { applyUtilityBillUpdate, createServiceClient, insertAgentLog, insertApproval } from "./store.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_ROOT = join(__dirname, "..", "..", "..", "logs");

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, "");
    if (key) args[key] = argv[i + 1] ?? "";
  }
  return args;
}

function mediaTypeFromPath(path: string): OcrInput["mediaType"] {
  if (path.endsWith(".pdf")) return "application/pdf";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function appendLog(entry: string, now: Date = new Date()) {
  const dir = join(LOGS_ROOT, logDatePath(now));
  mkdirSync(dir, { recursive: true });
  appendFileSync(join(dir, "data-collector.md"), entry);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { "bill-id": billId, "company-id": companyId, file } = args;
  if (!billId || !companyId || !file) {
    console.error("Usage: tsx src/run.ts --bill-id <id> --company-id <id> --file <path>");
    process.exit(1);
  }

  const imageBase64 = readFileSync(file).toString("base64");
  const extraction = await extractBillData({ imageBase64, mediaType: mediaTypeFromPath(file) });
  const status = decideBillStatus(extraction.confidence);
  const update = buildUtilityBillUpdate(extraction, status);

  const client = createServiceClient();
  await applyUtilityBillUpdate(client, billId, update);

  if (status === "pending_review") {
    await insertApproval(client, buildApprovalPayload(billId, companyId, extraction));
  }

  await insertAgentLog(client, {
    company_id: companyId,
    action: "extract_bill_data",
    input_summary: { bill_id: billId, file },
    output_summary: { status, confidence: extraction.confidence },
    requires_approval: status === "pending_review",
  });

  appendLog(formatLogEntry(billId, extraction, status));
  console.log(`data-collector: ${billId} → ${status} (confidence=${extraction.confidence})`);
}

main().catch((err) => {
  console.error("data-collector failed:", err);
  process.exit(1);
});
