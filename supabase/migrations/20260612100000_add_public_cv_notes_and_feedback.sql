alter table public.cvs
add column if not exists public_feedback_enabled boolean not null default false;

create table if not exists public.cv_public_notes (
  id uuid primary key default gen_random_uuid(),
  cv_id uuid not null references public.cvs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  anchor_type text not null check (anchor_type in ('presentation', 'section', 'item', 'bullet')),
  section_id text,
  anchor_id text,
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cv_public_notes enable row level security;

create policy "Owners manage CV public notes"
on public.cv_public_notes for all to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (select 1 from public.cvs where id = cv_id and user_id = (select auth.uid()))
);

create index if not exists cv_public_notes_cv_idx
on public.cv_public_notes (cv_id, created_at);

create table if not exists public.cv_public_feedback (
  id uuid primary key default gen_random_uuid(),
  cv_id uuid not null references public.cvs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  giver_name text,
  giver_context text,
  feedback_text text not null check (length(trim(feedback_text)) > 1),
  created_at timestamptz not null default now()
);

alter table public.cv_public_feedback enable row level security;
create policy "Owners read and delete public CV feedback"
on public.cv_public_feedback for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Owners delete public CV feedback"
on public.cv_public_feedback for delete to authenticated
using ((select auth.uid()) = user_id);

create table if not exists public.public_cv_feedback_rate_limits (
  ip_hash text not null,
  cv_id uuid not null references public.cvs(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.public_cv_feedback_rate_limits enable row level security;

create or replace function public.submit_public_cv_feedback(
  p_public_id text,
  p_ip_hash text,
  p_feedback_text text,
  p_giver_name text default null,
  p_giver_context text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_cv public.cvs%rowtype;
  feedback_id uuid;
begin
  select * into target_cv
  from public.cvs
  where public_id = p_public_id
    and public_enabled = true
    and public_feedback_enabled = true;

  if not found then raise exception 'PUBLIC_CV_FEEDBACK_DISABLED'; end if;
  if length(trim(p_feedback_text)) < 2 then raise exception 'INVALID_FEEDBACK'; end if;
  if (select count(*) from public.public_cv_feedback_rate_limits
      where ip_hash = p_ip_hash and cv_id = target_cv.id
        and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'RATE_LIMITED';
  end if;

  insert into public.public_cv_feedback_rate_limits(ip_hash, cv_id)
  values (p_ip_hash, target_cv.id);

  insert into public.cv_public_feedback(
    cv_id, user_id, giver_name, feedback_text, giver_context
  ) values (
    target_cv.id, target_cv.user_id, nullif(trim(p_giver_name), ''),
    trim(p_feedback_text), nullif(trim(p_giver_context), '')
  ) returning id into feedback_id;

  return feedback_id;
end;
$$;

revoke all on function public.submit_public_cv_feedback(text, text, text, text, text) from public;
grant execute on function public.submit_public_cv_feedback(text, text, text, text, text) to anon, authenticated, service_role;
