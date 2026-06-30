create unique index if not exists job_opportunities_id_user_unique_idx
on public.job_opportunities (id, user_id);

create table if not exists public.opportunity_people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_opportunity_id uuid not null,
  name text not null,
  role text not null,
  job_title text,
  organization text,
  email text,
  phone text,
  links jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_people_job_owner_fk
    foreign key (job_opportunity_id, user_id)
    references public.job_opportunities (id, user_id)
    on delete cascade,
  constraint opportunity_people_name_not_blank
    check (length(trim(name)) > 0),
  constraint opportunity_people_role_check
    check (role in (
      'external_recruiter',
      'internal_recruiter',
      'recruiting_coordinator',
      'human_resources',
      'hiring_manager',
      'potential_manager',
      'technical_interviewer',
      'business_interviewer',
      'culture_interviewer',
      'potential_teammate',
      'cross_functional_stakeholder',
      'department_leader',
      'executive',
      'internal_referral',
      'founder',
      'other'
    )),
  constraint opportunity_people_links_array
    check (jsonb_typeof(links) = 'array')
);

alter table public.opportunity_people enable row level security;

grant select, insert, update, delete
on table public.opportunity_people
to authenticated;

create policy "Users can read their opportunity people"
on public.opportunity_people for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their opportunity people"
on public.opportunity_people for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their opportunity people"
on public.opportunity_people for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their opportunity people"
on public.opportunity_people for delete
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists opportunity_people_user_opportunity_created_idx
on public.opportunity_people (user_id, job_opportunity_id, created_at asc);

drop trigger if exists opportunity_people_set_updated_at
on public.opportunity_people;
create trigger opportunity_people_set_updated_at
before update on public.opportunity_people
for each row
execute function public.set_updated_at();
