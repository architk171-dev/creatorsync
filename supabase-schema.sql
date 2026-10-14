-- Run this in your Supabase SQL Editor to set up the database

-- Users table
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text not null default '',
  avatar_url text,
  provider text default 'email',
  password_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_users_email on users(email);

-- Campaigns table
create table if not exists campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete set null,
  brief jsonb not null default '{}',
  analysis jsonb,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_campaigns_user on campaigns(user_id);

-- Reports table
create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete set null,
  platform text not null,
  handle text not null,
  report_data jsonb not null default '{}',
  report_type text default 'preview',
  created_at timestamptz default now()
);

create index if not exists idx_reports_user on reports(user_id);
create index if not exists idx_reports_handle on reports(handle);

-- Events table (user analytics + error logging)
create table if not exists events (
  id bigint generated always as identity primary key,
  event_name text not null,
  user_id uuid references users(id) on delete set null,
  email text,
  properties jsonb default '{}',
  error_message text,
  endpoint text,
  request_body jsonb,
  stack_trace text,
  created_at timestamptz default now()
);

create index if not exists idx_events_name on events(event_name);
create index if not exists idx_events_user on events(user_id);
create index if not exists idx_events_created on events(created_at desc);

-- Row Level Security
alter table users enable row level security;
alter table campaigns enable row level security;
alter table reports enable row level security;
alter table events enable row level security;

-- Service role can do everything (used server-side)
create policy "Service role full access" on users for all using (true);
create policy "Service role full access" on campaigns for all using (true);
create policy "Service role full access" on reports for all using (true);
create policy "Service role full access" on events for all using (true);
