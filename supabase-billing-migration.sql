-- Billing migration: run this once in the Supabase SQL editor.
-- Adds plan/subscription fields to users and a webhook idempotency log.

alter table users
  add column if not exists plan text not null default 'free',
  add column if not exists dodo_customer_id text,
  add column if not exists dodo_subscription_id text,
  add column if not exists plan_updated_at timestamptz;

create index if not exists idx_users_dodo_customer on users(dodo_customer_id);
create index if not exists idx_users_dodo_subscription on users(dodo_subscription_id);

-- Idempotency log so retried webhooks never apply twice
create table if not exists webhook_log (
  id bigint generated always as identity primary key,
  webhook_id text not null unique,
  event_type text not null,
  created_at timestamptz default now()
);

alter table webhook_log enable row level security;
create policy "Service role full access" on webhook_log for all using (true);
