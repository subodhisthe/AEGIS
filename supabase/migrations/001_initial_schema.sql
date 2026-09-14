-- ============================================================
-- Aegis Security Platform — Initial Schema
-- ============================================================

-- 1. Engagements
create table public.engagements (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  client_name text not null,
  status      text not null default 'in_progress'
                constraint engagements_status_check check (status in ('in_progress', 'complete')),
  created_at  timestamptz not null default now(),
  user_id     uuid not null references auth.users (id) on delete cascade
);

-- 2. Findings
create table public.findings (
  id              uuid primary key default gen_random_uuid(),
  engagement_id   uuid not null references public.engagements (id) on delete cascade,
  title           text not null,
  description     text,
  severity        text
                    constraint findings_severity_check check (severity in ('critical', 'high', 'medium', 'low')),
  affected_agent  text,
  soc2_control    text,
  status          text not null default 'open'
                    constraint findings_status_check check (status in ('open', 'remediated')),
  created_at      timestamptz not null default now()
);

-- 3. Reports
create table public.reports (
  id              uuid primary key default gen_random_uuid(),
  engagement_id   uuid not null references public.engagements (id) on delete cascade,
  generated_at    timestamptz not null default now(),
  status          text not null default 'draft'
                    constraint reports_status_check check (status in ('draft', 'final'))
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.engagements enable row level security;
alter table public.findings    enable row level security;
alter table public.reports     enable row level security;

-- Engagements: users see only their own rows
create policy "Users can select own engagements"
  on public.engagements for select
  using (auth.uid() = user_id);

create policy "Users can insert own engagements"
  on public.engagements for insert
  with check (auth.uid() = user_id);

create policy "Users can update own engagements"
  on public.engagements for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own engagements"
  on public.engagements for delete
  using (auth.uid() = user_id);

-- Findings: access via engagement ownership
create policy "Users can select findings for own engagements"
  on public.findings for select
  using (
    exists (
      select 1 from public.engagements
      where engagements.id = findings.engagement_id
        and engagements.user_id = auth.uid()
    )
  );

create policy "Users can insert findings for own engagements"
  on public.findings for insert
  with check (
    exists (
      select 1 from public.engagements
      where engagements.id = findings.engagement_id
        and engagements.user_id = auth.uid()
    )
  );

create policy "Users can update findings for own engagements"
  on public.findings for update
  using (
    exists (
      select 1 from public.engagements
      where engagements.id = findings.engagement_id
        and engagements.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.engagements
      where engagements.id = findings.engagement_id
        and engagements.user_id = auth.uid()
    )
  );

create policy "Users can delete findings for own engagements"
  on public.findings for delete
  using (
    exists (
      select 1 from public.engagements
      where engagements.id = findings.engagement_id
        and engagements.user_id = auth.uid()
    )
  );

-- Reports: access via engagement ownership
create policy "Users can select reports for own engagements"
  on public.reports for select
  using (
    exists (
      select 1 from public.engagements
      where engagements.id = reports.engagement_id
        and engagements.user_id = auth.uid()
    )
  );

create policy "Users can insert reports for own engagements"
  on public.reports for insert
  with check (
    exists (
      select 1 from public.engagements
      where engagements.id = reports.engagement_id
        and engagements.user_id = auth.uid()
    )
  );

create policy "Users can update reports for own engagements"
  on public.reports for update
  using (
    exists (
      select 1 from public.engagements
      where engagements.id = reports.engagement_id
        and engagements.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.engagements
      where engagements.id = reports.engagement_id
        and engagements.user_id = auth.uid()
    )
  );

create policy "Users can delete reports for own engagements"
  on public.reports for delete
  using (
    exists (
      select 1 from public.engagements
      where engagements.id = reports.engagement_id
        and engagements.user_id = auth.uid()
    )
  );
