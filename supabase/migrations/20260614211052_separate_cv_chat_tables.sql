create table public.cv_chat_conversations (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  cv_id uuid not null references public.cvs(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cv_chat_messages (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  cv_id uuid not null references public.cvs(id) on delete cascade,
  conversation_id uuid not null references public.cv_chat_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  model text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index cv_chat_conversations_user_cv_idx on public.cv_chat_conversations(user_id, cv_id);
create index cv_chat_messages_conversation_idx on public.cv_chat_messages(conversation_id, created_at);

alter table public.cv_chat_conversations enable row level security;
alter table public.cv_chat_messages enable row level security;

create policy "Users manage own CV chat conversations" on public.cv_chat_conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own CV chat messages" on public.cv_chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
