import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ReportInsert } from "./types.js";

export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  return createClient(url, key);
}

export async function insertReport(client: SupabaseClient, report: ReportInsert): Promise<string> {
  const { data, error } = await client.from("reports").insert(report).select("id").single();
  if (error) throw new Error(`Failed to insert report: ${error.message}`);
  return data.id as string;
}

export async function insertAgentLog(
  client: SupabaseClient,
  entry: {
    company_id: string;
    action: string;
    input_summary: unknown;
    output_summary: unknown;
  }
): Promise<void> {
  const { error } = await client.from("agent_logs").insert({
    agent_name: "compliance-generator",
    requires_approval: true, // every generator output needs evaluator + human sign-off downstream
    ...entry,
  });
  if (error) throw new Error(`Failed to insert agent_logs: ${error.message}`);
}
