create extension if not exists pgcrypto;

create table if not exists user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  default_budget_usd numeric(10, 2),
  preferred_profile text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  name text not null,
  destination text not null,
  price_usd numeric(10, 2) not null,
  data_gb numeric(10, 2) not null,
  validity_days integer not null,
  coverage_score numeric(4, 3) not null default 0.800,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  destination text not null,
  start_date date not null,
  end_date date not null,
  traveler_type text not null,
  budget_usd numeric(10, 2),
  usage_profile jsonb not null,
  estimated_gb numeric(10, 2),
  recommended_gb numeric(10, 2),
  selected_plan_id uuid references plans(id),
  recommendation jsonb not null default '{}'::jsonb,
  connectivity_guide jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  status text not null check (status in ('pending', 'running', 'completed', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists agent_steps (
  id uuid primary key default gen_random_uuid(),
  agent_run_id uuid not null references agent_runs(id) on delete cascade,
  step_name text not null,
  status text not null check (status in ('pending', 'running', 'completed', 'failed', 'skipped')),
  duration_ms integer not null default 0,
  input_summary text,
  output_summary text,
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb not null default '{}'::jsonb,
  retries integer not null default 0,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists trip_feedback (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  actual_usage_gb numeric(10, 2),
  rating integer check (rating between 1 and 5),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_trips_user_id on trips(user_id);
create index if not exists idx_trips_created_at on trips(created_at desc);
create index if not exists idx_agent_runs_trip_id on agent_runs(trip_id);
create index if not exists idx_agent_steps_run_id on agent_steps(agent_run_id);
create index if not exists idx_plans_destination on plans(destination);

alter table user_preferences enable row level security;
alter table plans enable row level security;
alter table trips enable row level security;
alter table agent_runs enable row level security;
alter table agent_steps enable row level security;
alter table trip_feedback enable row level security;

drop policy if exists "plans are readable by visitors" on plans;
drop policy if exists "users can read own preferences" on user_preferences;
drop policy if exists "users can insert own preferences" on user_preferences;
drop policy if exists "users can update own preferences" on user_preferences;
drop policy if exists "users can delete own preferences" on user_preferences;
drop policy if exists "users can read own trips" on trips;
drop policy if exists "users can insert own trips" on trips;
drop policy if exists "users can update own trips" on trips;
drop policy if exists "users can delete own trips" on trips;
drop policy if exists "users can read own agent runs" on agent_runs;
drop policy if exists "users can read own agent steps" on agent_steps;
drop policy if exists "users can read own trip feedback" on trip_feedback;
drop policy if exists "users can insert own trip feedback" on trip_feedback;
drop policy if exists "users can update own trip feedback" on trip_feedback;
drop policy if exists "users can delete own trip feedback" on trip_feedback;

create policy "plans are readable by visitors"
  on plans for select
  to anon, authenticated
  using (true);

create policy "users can read own preferences"
  on user_preferences for select
  to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid())::text);

create policy "users can insert own preferences"
  on user_preferences for insert
  to authenticated
  with check ((select auth.uid()) is not null and user_id = (select auth.uid())::text);

create policy "users can update own preferences"
  on user_preferences for update
  to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid())::text)
  with check ((select auth.uid()) is not null and user_id = (select auth.uid())::text);

create policy "users can delete own preferences"
  on user_preferences for delete
  to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid())::text);

create policy "users can read own trips"
  on trips for select
  to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid())::text);

create policy "users can insert own trips"
  on trips for insert
  to authenticated
  with check ((select auth.uid()) is not null and user_id = (select auth.uid())::text);

create policy "users can update own trips"
  on trips for update
  to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid())::text)
  with check ((select auth.uid()) is not null and user_id = (select auth.uid())::text);

create policy "users can delete own trips"
  on trips for delete
  to authenticated
  using ((select auth.uid()) is not null and user_id = (select auth.uid())::text);

create policy "users can read own agent runs"
  on agent_runs for select
  to authenticated
  using (
    exists (
      select 1
      from trips
      where trips.id = agent_runs.trip_id
        and (select auth.uid()) is not null
        and trips.user_id = (select auth.uid())::text
    )
  );

create policy "users can read own agent steps"
  on agent_steps for select
  to authenticated
  using (
    exists (
      select 1
      from agent_runs
      join trips on trips.id = agent_runs.trip_id
      where agent_runs.id = agent_steps.agent_run_id
        and (select auth.uid()) is not null
        and trips.user_id = (select auth.uid())::text
    )
  );

create policy "users can read own trip feedback"
  on trip_feedback for select
  to authenticated
  using (
    exists (
      select 1
      from trips
      where trips.id = trip_feedback.trip_id
        and (select auth.uid()) is not null
        and trips.user_id = (select auth.uid())::text
    )
  );

create policy "users can insert own trip feedback"
  on trip_feedback for insert
  to authenticated
  with check (
    exists (
      select 1
      from trips
      where trips.id = trip_feedback.trip_id
        and (select auth.uid()) is not null
        and trips.user_id = (select auth.uid())::text
    )
  );

create policy "users can update own trip feedback"
  on trip_feedback for update
  to authenticated
  using (
    exists (
      select 1
      from trips
      where trips.id = trip_feedback.trip_id
        and (select auth.uid()) is not null
        and trips.user_id = (select auth.uid())::text
    )
  )
  with check (
    exists (
      select 1
      from trips
      where trips.id = trip_feedback.trip_id
        and (select auth.uid()) is not null
        and trips.user_id = (select auth.uid())::text
    )
  );

create policy "users can delete own trip feedback"
  on trip_feedback for delete
  to authenticated
  using (
    exists (
      select 1
      from trips
      where trips.id = trip_feedback.trip_id
        and (select auth.uid()) is not null
        and trips.user_id = (select auth.uid())::text
    )
  );
