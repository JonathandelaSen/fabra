alter table public.performance_reviews
  add column if not exists activity_context_id uuid references public.activity_contexts(id) on delete set null;

create index if not exists performance_reviews_activity_context_idx
on public.performance_reviews (activity_context_id);
