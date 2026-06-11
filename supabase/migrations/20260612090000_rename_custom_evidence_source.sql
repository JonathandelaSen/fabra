alter table public.review_evidence_items
drop constraint if exists review_evidence_items_source_check;

update public.review_evidence_items
set source = 'custom'
where source = 'brain_dump';

alter table public.review_evidence_items
add constraint review_evidence_items_source_check
check (source in ('journal_entry', 'received_feedback', 'commitment', 'custom'));
