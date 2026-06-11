create table if not exists public.performance_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  review_type text not null check (review_type in ('performance_review', 'promotion_case')),
  review_date date not null,
  period_start date not null,
  period_end date not null,
  status text not null default 'draft' check (status in ('draft', 'prepared', 'completed')),
  self_assessment_content text,
  self_assessment_generated_at timestamptz,
  self_assessment_mode text check (self_assessment_mode in ('manual', 'copy_paste', 'integrated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint performance_reviews_title_not_blank
    check (length(trim(title)) > 0),
  constraint performance_reviews_period_valid
    check (period_start <= period_end)
);

alter table public.performance_reviews enable row level security;

create policy "Users can read their performance reviews"
on public.performance_reviews for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their performance reviews"
on public.performance_reviews for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their performance reviews"
on public.performance_reviews for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their performance reviews"
on public.performance_reviews for delete
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists performance_reviews_user_review_date_idx
on public.performance_reviews (user_id, review_date desc, created_at desc);

drop trigger if exists performance_reviews_set_updated_at on public.performance_reviews;
create trigger performance_reviews_set_updated_at
before update on public.performance_reviews
for each row
execute function public.set_updated_at();

create table if not exists public.review_evidence_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  review_id uuid not null references public.performance_reviews(id) on delete cascade,
  source text not null check (source in ('journal_entry', 'received_feedback', 'commitment', 'custom')),
  source_id uuid,
  content text not null,
  highlighted boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint review_evidence_items_content_not_blank
    check (length(trim(content)) > 0)
);

alter table public.review_evidence_items enable row level security;

create policy "Users can read their review evidence items"
on public.review_evidence_items for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their review evidence items"
on public.review_evidence_items for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their review evidence items"
on public.review_evidence_items for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their review evidence items"
on public.review_evidence_items for delete
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists review_evidence_items_review_position_idx
on public.review_evidence_items (review_id, position asc, created_at asc);

drop trigger if exists review_evidence_items_set_updated_at on public.review_evidence_items;
create trigger review_evidence_items_set_updated_at
before update on public.review_evidence_items
for each row
execute function public.set_updated_at();
