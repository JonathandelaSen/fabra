create table public.follow_up_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  follow_up_id uuid not null references public.follow_ups(id) on delete cascade,
  status text not null,
  title text,
  notes text,
  next_action text,
  next_action_at timestamptz,
  updates_current_status boolean not null default false,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint follow_up_entries_status_check
    check (status in ('interesting', 'applied', 'interview', 'offer', 'rejected', 'discarded')),
  constraint follow_up_entries_next_action_date_check
    check (next_action_at is null or length(trim(coalesce(next_action, ''))) > 0)
);

alter table public.follow_up_entries enable row level security;

grant select, insert, update, delete
on table public.follow_up_entries
to authenticated;

create policy "Users can read their follow up entries"
on public.follow_up_entries for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their follow up entries"
on public.follow_up_entries for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.follow_ups follow_up
    where follow_up.id = follow_up_id
      and follow_up.user_id = (select auth.uid())
  )
);

create policy "Users can update their follow up entries"
on public.follow_up_entries for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.follow_ups follow_up
    where follow_up.id = follow_up_id
      and follow_up.user_id = (select auth.uid())
  )
);

create policy "Users can delete their follow up entries"
on public.follow_up_entries for delete
to authenticated
using ((select auth.uid()) = user_id);

create index follow_up_entries_follow_up_occurred_idx
on public.follow_up_entries (follow_up_id, occurred_at desc, created_at desc);

create index follow_up_entries_user_created_idx
on public.follow_up_entries (user_id, created_at desc);

drop trigger if exists follow_up_entries_set_updated_at on public.follow_up_entries;
create trigger follow_up_entries_set_updated_at
before update on public.follow_up_entries
for each row
execute function public.set_updated_at();

create or replace function public.sync_follow_up_status_from_entry()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.updates_current_status then
    update public.follow_ups
    set
      status = new.status,
      updated_at = new.created_at
    where id = new.follow_up_id
      and user_id = new.user_id;

    if not found then
      raise exception 'Follow-up not found for tracking entry';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists follow_up_entries_sync_current_status on public.follow_up_entries;
create trigger follow_up_entries_sync_current_status
after insert on public.follow_up_entries
for each row
execute function public.sync_follow_up_status_from_entry();

insert into public.follow_up_entries (
  user_id,
  follow_up_id,
  status,
  title,
  notes,
  next_action,
  next_action_at,
  updates_current_status,
  occurred_at,
  created_at,
  updated_at
)
select
  user_id,
  id,
  status,
  null,
  notes,
  next_action,
  case
    when length(trim(coalesce(next_action, ''))) > 0 then next_action_at
    else null
  end,
  false,
  updated_at,
  updated_at,
  updated_at
from public.follow_ups;
