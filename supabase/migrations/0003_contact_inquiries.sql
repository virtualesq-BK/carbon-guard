-- Landing page "도입 문의" lead capture. Public-facing form, no auth required to
-- submit. Writable only via service-role application code (API route), same
-- convention as ruleset_versions/approvals — never directly from the client.
create table contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company_name text,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

alter table contact_inquiries enable row level security;

-- No policies granted: anon/authenticated roles have zero access by default.
-- Inserts and reads happen only through the service-role client in
-- apps/web/app/api/contact-inquiry/route.ts.
