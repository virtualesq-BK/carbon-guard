#!/usr/bin/env tsx
// CLI entry: builds a draft report (cbam_xml | cca_estimate) from already
// confirmed emission_records, inserts it, and logs. Report status stays
// "draft" — compliance-evaluator (Phase 6) must review before any approval
// gate can be passed.
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCbamReport } from "./build-cbam-report.js";
import { buildCcaReport } from "./build-cca-report.js";
import { formatLogEntry, logDatePath } from "./log.js";
import { createServiceClient, insertAgentLog, insertReport } from "./store.js";
import type { EmissionRecordInput } from "./types.js";

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
  appendFileSync(join(dir, "compliance-generator.md"), entry);
}

async function fetchConfirmedEmissionRecords(
  client: ReturnType<typeof createServiceClient>,
  companyId: string,
  periodStart: string,
  periodEnd: string
): Promise<EmissionRecordInput[]> {
  const { data, error } = await client
    .from("emission_records")
    .select("id, factor_ref, scope, emission_value, period_start, period_end")
    .eq("company_id", companyId)
    .gte("period_start", periodStart)
    .lte("period_end", periodEnd);
  if (error) throw new Error(`Failed to fetch emission_records: ${error.message}`);
  return data as EmissionRecordInput[];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { type, "company-id": companyId, "period-start": periodStart, "period-end": periodEnd } = args;

  if (!type || !companyId || !periodStart || !periodEnd) {
    console.error(
      "Usage: tsx src/run.ts --type <cbam_xml|cca_estimate> --company-id <id> " +
        "--period-start <YYYY-MM-DD> --period-end <YYYY-MM-DD> [--company-name <name>] " +
        "[--business-reg-number <n>] [--year <YYYY>] [--carbon-intensity-margin-tons <n>]"
    );
    process.exit(1);
  }

  const client = createServiceClient();
  const emissionRecords = await fetchConfirmedEmissionRecords(client, companyId, periodStart, periodEnd);

  const report =
    type === "cbam_xml"
      ? buildCbamReport({
          companyId,
          companyName: args["company-name"] ?? "",
          companyBusinessRegNumber: args["business-reg-number"] ?? "",
          periodStart,
          periodEnd,
          emissionRecords,
        })
      : buildCcaReport({
          companyId,
          periodStart,
          periodEnd,
          year: Number(args.year),
          carbonIntensityMarginTons: Number(args["carbon-intensity-margin-tons"]),
        });

  const reportId = await insertReport(client, report);

  await insertAgentLog(client, {
    company_id: companyId,
    action: "generate_report",
    input_summary: { type, periodStart, periodEnd, emission_record_count: emissionRecords.length },
    output_summary: { report_id: reportId, status: report.status },
  });

  appendLog(
    formatLogEntry(
      reportId,
      report.report_type,
      emissionRecords.map((r) => r.id),
      Array.from(new Set(emissionRecords.map((r) => r.factor_ref)))
    )
  );

  console.log(`compliance-generator: created draft report ${reportId} (${report.report_type})`);
}

main().catch((err) => {
  console.error("compliance-generator failed:", err);
  process.exit(1);
});
