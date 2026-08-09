-- Human-approval queue. Every risky/irreversible action reads this table before
-- executing; agents and MCP write tools never act unilaterally.
-- 7 checkpoints per root CLAUDE.md 승인 게이트:
--   1. ruleset_change            5. billing_change
--   2. external_report_submit    6. low_confidence_ocr_confirm
--   3. customer_notification     7. high_risk_report_publish
--   4. db_deletion_correction

create table approvals (
  id uuid primary key default gen_random_uuid(),
  checkpoint text not null check (checkpoint in (
    'ruleset_change',
    'external_report_submit',
    'customer_notification',
    'db_deletion_correction',
    'billing_change',
    'low_confidence_ocr_confirm',
    'high_risk_report_publish'
  )),
  entity_type text not null, -- e.g. 'ruleset_versions', 'reports', 'utility_bills'
  entity_id uuid not null,
  company_id uuid references companies(id) on delete cascade,
  requested_by text not null, -- agent name (e.g. 'reg-watcher') or 'system'
  payload jsonb not null, -- dry-run content: what WOULD be written if approved
  risk_score int check (risk_score between 0 and 100), -- populated for checkpoint 7
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  decision_reason text,
  created_at timestamptz not null default now()
);

alter table approvals enable row level security;

create policy "owner can view own company approvals" on approvals
  for select using (
    company_id is null
    or company_id in (select id from companies where owner_user_id = auth.uid())
  );

-- Approve/reject decisions and inserts happen only via service-role application
-- code (the approval-gate API route), never directly from the client or an agent.
