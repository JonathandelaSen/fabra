create table public.ai_interaction_events (
  id uuid primary key default gen_random_uuid(),
  interaction_id uuid not null,
  attempt_id uuid not null,
  event_name text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  module text not null,
  operation text not null,
  entity_type text not null,
  entity_id text not null,
  assistance_mode text not null,
  provider text not null,
  model text,
  payload jsonb not null,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index ai_interaction_events_interaction_id_idx
  on public.ai_interaction_events (interaction_id, occurred_at);

create index ai_interaction_events_entity_idx
  on public.ai_interaction_events (entity_type, entity_id, occurred_at desc);

alter table public.ai_interaction_events enable row level security;
