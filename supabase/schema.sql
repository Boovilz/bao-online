create extension if not exists pgcrypto;

create table if not exists public.player_profiles (
  id uuid primary key default gen_random_uuid(),
  classroom_id text not null,
  username text not null,
  display_name text not null,
  character text not null default 'boy',
  classroom text,
  student_number text,
  team text,
  level integer not null default 1 check (level >= 1),
  exp integer not null default 0 check (exp between 0 and 99),
  coin integer not null default 0 check (coin >= 0),
  inventory jsonb not null default '{}'::jsonb,
  quest jsonb not null default '{}'::jsonb,
  learning jsonb not null default '{}'::jsonb,
  badges jsonb not null default '[]'::jsonb,
  status text not null default 'offline' check (status in ('online','afk','offline')),
  current_location text,
  last_action text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (classroom_id, username)
);

create table if not exists public.classroom_events (
  id uuid primary key default gen_random_uuid(),
  classroom_id text not null,
  title text not null,
  description text,
  target_team text,
  duration_minutes integer not null default 15,
  reward_exp integer not null default 0,
  reward_coin integer not null default 0,
  status text not null default 'draft' check (status in ('draft','active','paused','finished')),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id bigint generated always as identity primary key,
  classroom_id text not null,
  username text,
  event_type text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists player_profiles_touch_updated_at on public.player_profiles;
create trigger player_profiles_touch_updated_at
before update on public.player_profiles
for each row execute function public.touch_updated_at();

alter table public.player_profiles enable row level security;
alter table public.classroom_events enable row level security;
alter table public.activity_logs enable row level security;

-- Sprint 8.1 uses classroom-scoped demo access. Replace these policies with
-- authenticated teacher/student policies before production use.
create policy "demo read player profiles" on public.player_profiles for select using (true);
create policy "demo insert player profiles" on public.player_profiles for insert with check (true);
create policy "demo update player profiles" on public.player_profiles for update using (true) with check (true);
create policy "demo read classroom events" on public.classroom_events for select using (true);
create policy "demo manage classroom events" on public.classroom_events for all using (true) with check (true);
create policy "demo read activity logs" on public.activity_logs for select using (true);
create policy "demo insert activity logs" on public.activity_logs for insert with check (true);

alter publication supabase_realtime add table public.player_profiles;
alter publication supabase_realtime add table public.classroom_events;
alter publication supabase_realtime add table public.activity_logs;
