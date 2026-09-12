-- DaVinci core schema: jobs, messages, agent_events.
-- Minimal operational state only (see docs/data-model.md).

create extension if not exists "pgcrypto";

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  customer_phone text not null,
  customer_name text,
  service_type text not null default 'unknown'
    check (service_type in ('plumbing', 'hvac', 'electrical', 'repair', 'other', 'unknown')),
  description text,
  city text,
  address text,
  urgency text not null default 'normal'
    check (urgency in ('low', 'normal', 'high', 'emergency')),
  preferred_date text,
  preferred_time text,
  ai_summary text,
  assigned_worker text,
  status text not null default 'NEW'
    check (status in (
      'NEW', 'QUALIFYING', 'QUALIFIED', 'WAITING_FOR_CREW', 'ACCEPTED', 'CUSTOMER_NOTIFIED',
      'HUMAN_REQUIRED', 'DECLINED', 'FAILED'
    )),
  missing_information text[] not null default '{}',
  safety_concern boolean not null default false,
  safety_reason text,
  has_photo boolean not null default false,
  has_voice boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_customer_phone_idx on jobs (customer_phone);
create index if not exists jobs_status_idx on jobs (status);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs (id) on delete cascade,
  sender_role text not null check (sender_role in ('CUSTOMER', 'CREW', 'SYSTEM')),
  direction text not null check (direction in ('inbound', 'outbound')),
  message_type text not null check (message_type in ('text', 'voice', 'image', 'location', 'system')),
  content text,
  media_url text,
  provider_message_sid text unique,
  created_at timestamptz not null default now()
);

create index if not exists messages_job_id_idx on messages (job_id);

create table if not exists agent_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs (id) on delete cascade,
  event_type text not null,
  tool text,
  status text not null check (status in ('success', 'failure', 'pending')),
  input_summary text,
  output_summary text,
  created_at timestamptz not null default now()
);

create index if not exists agent_events_job_id_idx on agent_events (job_id);
