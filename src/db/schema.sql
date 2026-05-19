-- HireReady — Supabase schema
-- Run in the Supabase SQL editor (or via `supabase db push`).
-- Idempotent: safe to re-run.

create extension if not exists "pgcrypto";

-- =============================================================
-- users (mirror of auth.users with app-level profile + plan)
-- =============================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free','pro','premium')),
  plan_expires_at timestamptz,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================
-- resumes
-- =============================================================
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  template text not null default 'clean' check (template in ('clean','modern','executive')),
  content_json jsonb not null default '{}'::jsonb,
  last_ats_score int check (last_ats_score between 0 and 100),
  target_role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists resumes_user_id_idx on public.resumes(user_id);

-- =============================================================
-- job_applications
-- =============================================================
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  company text not null,
  role text not null,
  job_url text,
  job_description text,
  status text not null default 'saved'
    check (status in ('saved','applied','phone_screen','interview','offer','rejected')),
  applied_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists job_applications_user_id_idx on public.job_applications(user_id);
create index if not exists job_applications_status_idx on public.job_applications(status);

-- =============================================================
-- ats_scores
-- =============================================================
create table if not exists public.ats_scores (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  job_application_id uuid references public.job_applications(id) on delete set null,
  score int not null check (score between 0 and 100),
  feedback_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists ats_scores_resume_id_idx on public.ats_scores(resume_id);

-- =============================================================
-- cover_letters
-- =============================================================
create table if not exists public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  job_application_id uuid references public.job_applications(id) on delete set null,
  content text not null,
  tone text not null default 'professional'
    check (tone in ('professional','enthusiastic','concise')),
  created_at timestamptz not null default now()
);
create index if not exists cover_letters_user_id_idx on public.cover_letters(user_id);

-- =============================================================
-- mock_interviews
-- =============================================================
create table if not exists public.mock_interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null,
  experience_level text,
  company text,
  interview_type text not null default 'behavioral'
    check (interview_type in ('behavioral','technical','mixed')),
  questions_json jsonb not null default '[]'::jsonb,
  answers_json jsonb not null default '[]'::jsonb,
  scores_json jsonb not null default '[]'::jsonb,
  overall_score int check (overall_score between 0 and 100),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists mock_interviews_user_id_idx on public.mock_interviews(user_id);

-- =============================================================
-- daily_usage (paywall enforcement counters)
-- =============================================================
create table if not exists public.daily_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  usage_date date not null default current_date,
  resumes_created int not null default 0,
  ats_checks int not null default 0,
  cover_letters_created int not null default 0,
  interviews_started int not null default 0,
  unique (user_id, usage_date)
);
create index if not exists daily_usage_user_date_idx on public.daily_usage(user_id, usage_date);

-- =============================================================
-- updated_at trigger
-- =============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists trg_resumes_updated_at on public.resumes;
create trigger trg_resumes_updated_at before update on public.resumes
  for each row execute function public.set_updated_at();

drop trigger if exists trg_job_applications_updated_at on public.job_applications;
create trigger trg_job_applications_updated_at before update on public.job_applications
  for each row execute function public.set_updated_at();

-- =============================================================
-- New-user provisioning: auto-create public.users row on signup
-- =============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- Row Level Security — every table is per-user
-- =============================================================
alter table public.users             enable row level security;
alter table public.resumes           enable row level security;
alter table public.job_applications  enable row level security;
alter table public.ats_scores        enable row level security;
alter table public.cover_letters     enable row level security;
alter table public.mock_interviews   enable row level security;
alter table public.daily_usage       enable row level security;

-- users: a user can read/update only their own profile row
drop policy if exists "users self read"   on public.users;
drop policy if exists "users self update" on public.users;
create policy "users self read"   on public.users for select using (auth.uid() = id);
create policy "users self update" on public.users for update using (auth.uid() = id);

-- generic owner-only policies for the rest
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'resumes','job_applications','cover_letters','mock_interviews','daily_usage'
  ]) loop
    execute format('drop policy if exists "%I owner all" on public.%I;', t, t);
    execute format(
      'create policy "%I owner all" on public.%I for all
         using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      t, t
    );
  end loop;
end$$;

-- ats_scores has no user_id column — gate via the parent resume
drop policy if exists "ats_scores owner all" on public.ats_scores;
create policy "ats_scores owner all" on public.ats_scores for all
  using (
    exists (select 1 from public.resumes r
            where r.id = ats_scores.resume_id and r.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.resumes r
            where r.id = ats_scores.resume_id and r.user_id = auth.uid())
  );
