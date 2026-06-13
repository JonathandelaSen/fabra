create table public.ai_interaction_reviews (
  interaction_id uuid primary key,
  reviewer_user_id uuid not null references auth.users(id) on delete cascade,
  rating text not null check (rating in ('good', 'mixed', 'bad')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_interaction_reviews enable row level security;
