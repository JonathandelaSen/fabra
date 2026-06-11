-- Processing events observability has been replaced by Sentry.
-- Drop the internal processing_events table and its policies/indexes.
-- The admin_users table is retained because it still gates admin access.

drop policy if exists "Admins can read processing events" on public.processing_events;

drop table if exists public.processing_events;
