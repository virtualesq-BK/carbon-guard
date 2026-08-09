#!/usr/bin/env tsx
// CLI entry: fetches a draft report, runs structural + narrative-risk checks,
// records risk_score/findings, and (if risk_score > 70) opens a human
// approval request. Never modifies report.content — findings only.
// Usage: tsx src/run.ts --report-id <id>
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateReportWithFindings } from "./evaluate.js";
import { checkReportStructurally } from "./structural-checks.js";
import { checkReportNarrativeRisk } from "./llm-checks.js";
import { formatLogEntry, logDatePath } from "./log.js";
import {
  applyEvaluation,
  createServiceClient,
  fetchReportForEvaluation,
  insertAgentLog,
  insertHighRiskApproval,
} from "./store.js";

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

function appendLog(entry: string, now: Date = new Date()) {
  const dir = join(LOGS_ROOT, logDatePath(now));
  mkdirSync(dir, { recursive: true });
  appendFileSync(join(dir, "compliance-evaluator.md"), entry);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const reportId = args["report-id"];
  if (!reportId) {
    console.error("Usage: tsx src/run.ts --report-id <id>");
    process.exit(1);
  }

  const client = createServiceClient();
  const report = await fetchReportForEvaluation(client, reportId);

  const structuralFindings = checkReportStructurally(report);
  const narrativeFindings = await checkReportNarrativeRisk(report);
  const evaluation = evaluateReportWithFindings([...structuralFindings, ...narrativeFindings]);

  await applyEvaluation(client, reportId, evaluation);

  if (evaluation.requiresHumanReview) {
    await insertHighRiskApproval(client, reportId, report.company_id, evaluation);
  }

  await insertAgentLog(client, {
    company_id: report.company_id,
    action: "evaluate_report",
    input_summary: { report_id: reportId, report_type: report.report_type },
    output_summary: { risk_score: evaluation.riskScore, finding_count: evaluation.findings.length },
    requires_approval: evaluation.requiresHumanReview,
  });

  appendLog(
    formatLogEntry(reportId, evaluation.riskScore, evaluation.findings, evaluation.requiresHumanReview)
  );

  console.log(
    `compliance-evaluator: report ${reportId} → risk_score=${evaluation.riskScore} ` +
      `(${evaluation.requiresHumanReview ? "human_review_required" : "auto_pass"})`
  );
}

main().catch((err) => {
  console.error("compliance-evaluator failed:", err);
  process.exit(1);
});
