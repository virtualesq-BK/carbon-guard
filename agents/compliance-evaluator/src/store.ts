import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { EvaluationResult } from "./evaluate.js";
import type { ReportForEvaluation } from "./schema.js";

export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  return createClient(url, key);
}

export async function fetchReportForEvaluation(
  client: SupabaseClient,
  reportId: string
): Promise<ReportForEvaluation & { company_id: string }> {
  const { data, error } = await client
    .from("reports")
    .select("report_type, period_start, period_end, content, company_id")
    .eq("id", reportId)
    .single();
  if (error) throw new Error(`Failed to fetch report ${reportId}: ${error.message}`);
  return data as ReportForEvaluation & { company_id: string };
}

/**
 * Records the evaluation and, importantly, never changes report.status past
 * "evaluated" — only a human can move it to "approved"/"submitted"
 * (root CLAUDE.md 승인 게이트 ⑦).
 */
export async function applyEvaluation(
  client: SupabaseClient,
  reportId: string,
  evaluation: EvaluationResult
): Promise<void> {
  const { error } = await client
    .from("reports")
    .update({
      status: "evaluated",
      risk_score: evaluation.riskScore,
      evaluator_findings: evaluation.findings,
    })
    .eq("id", reportId);
  if (error) throw new Error(`Failed to apply evaluation to report ${reportId}: ${error.message}`);
}

export async function insertHighRiskApproval(
  client: SupabaseClient,
  reportId: string,
  companyId: string,
  evaluation: EvaluationResult
): Promise<void> {
  const { error } = await client.from("approvals").insert({
    checkpoint: "high_risk_report_publish",
    entity_type: "reports",
    entity_id: reportId,
    company_id: companyId,
    requested_by: "compliance-evaluator",
    payload: { risk_score: evaluation.riskScore, findings: evaluation.findings },
    risk_score: evaluation.riskScore,
    status: "pending",
  });
  if (error) throw new Error(`Failed to insert approval for report ${reportId}: ${error.message}`);
}

export async function insertAgentLog(
  client: SupabaseClient,
  entry: {
    company_id: string;
    action: string;
    input_summary: unknown;
    output_summary: unknown;
    requires_approval: boolean;
  }
): Promise<void> {
  const { error } = await client.from("agent_logs").insert({
    agent_name: "compliance-evaluator",
    ...entry,
  });
  if (error) throw new Error(`Failed to insert agent_logs: ${error.message}`);
}
