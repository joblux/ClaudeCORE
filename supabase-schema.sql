-- ═══════════════════════════════════════════════════════
-- JOBLUX DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ═══════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── SUBSCRIBERS (newsletter) ─────────────────────────────
create table if not exists subscribers (
  id          uuid primary key default uuid_generate_v4(),
  email       text unique not null,
  name        text,
  subscribed  boolean default true,
  created_at  timestamptz default now()
);

-- ── PROFILES (all member types) ──────────────────────────
create table if not exists profiles (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid references auth.users(id) on delete cascade,
  user_type           text not null check (user_type in ('candidate','employer','influencer')),
  status              text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  email               text not null,
  full_name           text not null,
  photo_url           text,
  current_title       text,
  current_maison      text,
  location_city       text,
  nationality         text,
  languages           text[] default '{}',
  years_in_luxury     integer,
  work_permit         text,
  bio                 text check (char_length(bio) <= 280),

  -- Candidate fields
  career_history      jsonb default '[]',
  education           jsonb default '[]',
  categories          text[] default '{}',
  functions           text[] default '{}',
  target_markets      text[] default '{}',
  maison_tier_pref    text,
  availability        text check (availability in ('open','discreet','not_looking')),
  available_from      date,
  notice_period       text,
  relocation          boolean,
  relocation_cities   text[] default '{}',
  contract_type       text,
  salary_min          integer,
  salary_currency     text default 'EUR',
  deal_breakers       text,

  -- Employer fields
  company_name        text,
  company_size        text,
  company_markets     text[] default '{}',
  hiring_markets      text[] default '{}',
  preferred_seniority text,
  hiring_frequency    text,
  nda_required        boolean default false,
  contact_method      text,
  reason_for_joining  text,

  -- Influencer fields
  instagram_handle      text,
  linkedin_handle       text,
  instagram_followers   integer,
  content_categories    text[] default '{}',
  collaboration_type    text,

  -- Admin fields (never exposed to member)
  internal_notes      text,
  tags                text[] default '{}',
  source              text,
  referral_code       text unique default substr(md5(random()::text), 1, 8),
  referred_by         text,
  last_active         timestamptz,
  engagement_score    integer default 0,

  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── JOB MANDATES ─────────────────────────────────────────
create table if not exists job_mandates (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  maison_display   text not null,
  category         text not null,
  function         text,
  market           text not null,
  city             text not null,
  seniority        text not null,
  salary_min       integer not null,
  salary_max       integer not null,
  salary_currency  text default 'EUR',
  contract_type    text default 'permanent',
  is_confidential  boolean default true,
  description      text,
  requirements     text,
  status           text default 'open' check (status in ('open','closed','filled')),
  created_at       timestamptz default now(),
  expires_at       timestamptz
);

-- ── ARTICLES ─────────────────────────────────────────────
create table if not exists articles (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  slug          text unique not null,
  excerpt       text,
  content       text not null,
  category      text not null check (category in ('bloglux','interview','travel','salary','career','news')),
  author_name   text not null,
  author_id     uuid references profiles(id),
  cover_image   text,
  published     boolean default false,
  published_at  timestamptz,
  read_time     integer,
  tags          text[] default '{}',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── JOB APPLICATIONS ─────────────────────────────────────
create table if not exists applications (
  id           uuid primary key default uuid_generate_v4(),
  mandate_id   uuid references job_mandates(id),
  candidate_id uuid references profiles(id),
  status       text default 'applied' check (status in ('applied','reviewed','shortlisted','placed','rejected')),
  notes        text,
  created_at   timestamptz default now()
);

-- ── EMPLOYER BRIEFS ───────────────────────────────────────
create table if not exists employer_briefs (
  id             uuid primary key default uuid_generate_v4(),
  employer_id    uuid references profiles(id),
  role_title     text not null,
  category       text not null,
  market         text not null,
  city           text not null,
  seniority      text not null,
  salary_budget  text,
  timeline       text,
  is_confidential boolean default true,
  description    text,
  status         text default 'received' check (status in ('received','in_progress','filled','closed')),
  created_at     timestamptz default now()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────

-- Subscribers: only service role can read, anyone can insert
alter table subscribers enable row level security;
create policy "Anyone can subscribe" on subscribers for insert with check (true);
create policy "Service role only" on subscribers for select using (auth.role() = 'service_role');

-- Profiles: members see only their own, admin sees all
alter table profiles enable row level security;
create policy "Members see own profile" on profiles for select using (auth.uid() = user_id);
create policy "Members update own profile" on profiles for update using (auth.uid() = user_id);
create policy "Anyone can create profile" on profiles for insert with check (true);
create policy "Service role sees all" on profiles for all using (auth.role() = 'service_role');

-- Job mandates: approved members can view open mandates
alter table job_mandates enable row level security;
create policy "Approved members see open mandates" on job_mandates for select using (
  status = 'open' and exists (
    select 1 from profiles where user_id = auth.uid() and status = 'approved'
  )
);
create policy "Service role manages mandates" on job_mandates for all using (auth.role() = 'service_role');

-- Articles: anyone can see published articles
alter table articles enable row level security;
create policy "Anyone sees published articles" on articles for select using (published = true);
create policy "Service role manages articles" on articles for all using (auth.role() = 'service_role');

-- Applications: candidates see their own
alter table applications enable row level security;
create policy "Candidates see own applications" on applications for select using (
  exists (select 1 from profiles where id = candidate_id and user_id = auth.uid())
);
create policy "Candidates can apply" on applications for insert with check (
  exists (select 1 from profiles where id = candidate_id and user_id = auth.uid() and status = 'approved')
);
create policy "Service role manages applications" on applications for all using (auth.role() = 'service_role');

-- Employer briefs: employers see their own
alter table employer_briefs enable row level security;
create policy "Employers see own briefs" on employer_briefs for select using (
  exists (select 1 from profiles where id = employer_id and user_id = auth.uid())
);
create policy "Employers can submit briefs" on employer_briefs for insert with check (
  exists (select 1 from profiles where id = employer_id and user_id = auth.uid() and status = 'approved')
);
create policy "Service role manages briefs" on employer_briefs for all using (auth.role() = 'service_role');

-- ── INDEXES ───────────────────────────────────────────────
create index if not exists idx_profiles_user_id   on profiles(user_id);
create index if not exists idx_profiles_status     on profiles(status);
create index if not exists idx_profiles_user_type  on profiles(user_type);
create index if not exists idx_mandates_status     on job_mandates(status);
create index if not exists idx_mandates_market     on job_mandates(market);
create index if not exists idx_articles_slug       on articles(slug);
create index if not exists idx_articles_category   on articles(category);
create index if not exists idx_articles_published  on articles(published);
create index if not exists idx_subscribers_email   on subscribers(email);

-- ── UPDATED AT TRIGGER ────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger articles_updated_at before update on articles
  for each row execute function update_updated_at();

-- ═══════════════════════════════════════════════════════
-- DONE. Your JOBLUX database is ready.
-- ═══════════════════════════════════════════════════════
