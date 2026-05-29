-- Rename follow-up status values from Spanish to English

-- 1. Drop existing constraint
alter table public.follow_ups
  drop constraint if exists follow_ups_status_check;

-- 2. Update values
update public.follow_ups set status = 'interesting' where status = 'interesante';
update public.follow_ups set status = 'applied'     where status = 'aplicado';
update public.follow_ups set status = 'interview'   where status = 'entrevista';
update public.follow_ups set status = 'offer'       where status = 'oferta';
update public.follow_ups set status = 'rejected'    where status = 'rechazado';
update public.follow_ups set status = 'discarded'   where status = 'descartado';

-- 3. Re-add constraint with English values
alter table public.follow_ups
  add constraint follow_ups_status_check
  check (
    status in (
      'interesting',
      'applied',
      'interview',
      'offer',
      'rejected',
      'discarded'
    )
  );

-- 4. Update default
alter table public.follow_ups
  alter column status set default 'interesting';
