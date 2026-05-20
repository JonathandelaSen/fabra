-- Add activity_context_id to feedback_notes_feedbacks table
alter table public.feedback_notes_feedbacks
add column if not exists activity_context_id uuid references public.activity_contexts(id) on delete restrict;

-- Update existing feedbacks to use the default context for their user
update public.feedback_notes_feedbacks feedback
set activity_context_id = context.id
from public.activity_contexts context
where feedback.activity_context_id is null
  and context.user_id = feedback.user_id
  and context.is_default;

-- Make it not null after migration
alter table public.feedback_notes_feedbacks
alter column activity_context_id set not null;

-- Add index
create index if not exists feedback_notes_feedbacks_user_activity_context_idx
on public.feedback_notes_feedbacks (user_id, activity_context_id, updated_at desc);

-- Update count_activity_context_records RPC
create or replace function public.count_activity_context_records(
  p_user_id uuid,
  p_context_id uuid
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  total integer;
begin
  select
    (
      select count(*) from public.work_journal_entries
      where user_id = p_user_id and activity_context_id = p_context_id
    ) +
    (
      select count(*) from public.commitments
      where user_id = p_user_id and activity_context_id = p_context_id
    ) +
    (
      select count(*) from public.received_feedback
      where user_id = p_user_id and activity_context_id = p_context_id
    ) +
    (
      select count(*) from public.feedback_notes_feedbacks
      where user_id = p_user_id and activity_context_id = p_context_id
    )
  into total;

  return coalesce(total, 0);
end;
$$;

-- Update reassign_activity_context_records RPC
create or replace function public.reassign_activity_context_records(
  p_user_id uuid,
  p_source_context_id uuid,
  p_default_context_id uuid
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  total integer := 0;
  changed integer := 0;
begin
  update public.work_journal_entries
  set activity_context_id = p_default_context_id
  where user_id = p_user_id and activity_context_id = p_source_context_id;
  get diagnostics changed = row_count;
  total := total + changed;

  update public.commitments
  set activity_context_id = p_default_context_id
  where user_id = p_user_id and activity_context_id = p_source_context_id;
  get diagnostics changed = row_count;
  total := total + changed;

  update public.received_feedback
  set activity_context_id = p_default_context_id
  where user_id = p_user_id and activity_context_id = p_source_context_id;
  get diagnostics changed = row_count;
  total := total + changed;

  update public.feedback_notes_feedbacks
  set activity_context_id = p_default_context_id
  where user_id = p_user_id and activity_context_id = p_source_context_id;
  get diagnostics changed = row_count;
  total := total + changed;

  return total;
end;
$$;
