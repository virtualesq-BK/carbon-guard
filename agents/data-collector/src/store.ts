import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { UtilityBillUpdate } from "./bill-update.js";
import type { ApprovalInsert } from "./approval.js";

/** Service-role client — bypasses RLS. Only ever run server-side/in the agent process. */
export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  return createClient(url, key);
}

export async function applyUtilityBillUpdate(
  client: SupabaseClient,
  billId: string,
  update: UtilityBillUpdate
): Promise<void> {
  const { error } = await client.from("utility_bills").update(update).eq("id", billId);
  if (error) throw new Error(`Failed to update utility_bills(${billId}): ${error.message}`);
}

export async function insertApproval(client: SupabaseClient, approval: ApprovalInsert): Promise<void> {
  const { error } = await client.from("approvals").insert(approval);
  if (error) throw new Error(`Failed to insert approval: ${error.message}`);
}

export async function insertAgentLog(
  client: SupabaseClient,
  entry: {
    company_id: string;
    action: string;
    input_summary: unknown;
    output_summary: unknown;
    requires_approval: boolean;
    error?: string;
  }
): Promise<void> {
  const { error } = await client.from("agent_logs").insert({
    agent_name: "data-collector",
    ...entry,
  });
  if (error) throw new Error(`Failed to insert agent_logs: ${error.message}`);
}
