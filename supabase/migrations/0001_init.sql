-- CarbonGuard initial schema
-- companies, utility_bills, emission_records, reports, ruleset_versions, agent_logs
create extension if not exists "pgcrypto";

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_reg_number text,
  industry_code text,
  export_markets text[] not null default '{}', -- e.g. {'EU_CBAM','US_CCA'}
  owner_user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table utility_bills (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  bill_type text not null check (bill_type in ('electricity', 'gas', 'fuel', 'steam', 'other')),
  billing_period_start date not null,
  billing_period_end date not null,
  file_path text not null, -- Supabase Storage path to original scan/PDF
  ocr_raw jsonb, -- raw Claude Vision OCR output
  ocr_confidence numeric(3,2), -- 0.00-1.00
  extracted_quantity numeric,
  extracted_unit text,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'confirmed', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table emission_records (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  utility_bill_id uuid references utility_bills(id) on delete set null,
  factor_ref text not null, -- e.g. 'kr-nga/2026-01/electricity'
  activity_quantity numeric not null,
  activity_unit text not null,
  emission_value numeric not null, -- tCO2e
  scope text not null check (scope in ('scope1', 'scope2', 'scope3')),
  period_start date not null,
  period_end date not null,
  computed_by text not null default 'emission-engine', -- always deterministic engine, never LLM
  created_at timestamptz not null default now()
);

create table ruleset_versions (
  id uuid primary key default gen_random_uuid(),
  ruleset_type text not null check (ruleset_type in ('factor', 'regulation')),
  ruleset_key text not null, -- e.g. 'kr-nga/electricity' or 'cbam'
  version text not null, -- e.g. '2026-01'
  file_path text not null, -- path within packages/ruleset
  source_url text, -- required for approval; TODO if unknown, never fabricated
  changelog_entry text not null,
  proposed_by text not null default 'reg-watcher',
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  status text not null default 'proposed'
    check (status in ('proposed', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  report_type text not null check (report_type in ('cbam_xml', 'cca_estimate', 'csrd')),
  period_start date not null,
  period_end date not null,
  generated_by text not null default 'compliance-generator',
  content jsonb not null,
  risk_score int check (risk_score between 0 and 100),
  evaluator_findings jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'evaluated', 'approved', 'submitted', 'rejected')),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

create table agent_logs (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null check (agent_name in
    ('reg-watcher', 'data-collector', 'compliance-generator', 'compliance-evaluator')),
  run_id uuid not null default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  action text not null,
  input_summary jsonb,
  output_summary jsonb,
  requires_approval boolean not null default false,
  approved boolean,
  error text,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table companies enable row level security;
alter table utility_bills enable row level security;
alter table emission_records enable row level security;
alter table ruleset_versions enable row level security;
alter table reports enable row level security;
alter table agent_logs enable row level security;

create policy "owner can manage own company" on companies
  for all using (owner_user_id = auth.uid());

create policy "owner can access own bills" on utility_bills
  for all using (company_id in (select id from companies where owner_user_id = auth.uid()));

create policy "owner can access own emissions" on emission_records
  for all using (company_id in (select id from companies where owner_user_id = auth.uid()));

create policy "owner can access own reports" on reports
  for all using (company_id in (select id from companies where owner_user_id = auth.uid()));

create policy "owner can view own agent logs" on agent_logs
  for select using (company_id in (select id from companies where owner_user_id = auth.uid()));

-- ruleset_versions is global (not company-scoped); readable by all authenticated users,
-- writable only via service role (approval gate enforced in application layer, not RLS).
create policy "authenticated can read ruleset_versions" on ruleset_versions
  for select using (auth.role() = 'authenticated');
