-- Rename offer status values from Spanish to English

-- 1. Drop existing constraints
alter table public.analyses
  drop constraint if exists analyses_offer_status_check;

alter table public.follow_ups
  drop constraint if exists follow_ups_status_check;

-- 2. Update analyses.offer_status
update public.analyses set offer_status = 'interesting' where offer_status = 'interesante';
update public.analyses set offer_status = 'applied'     where offer_status = 'aplicado';
update public.analyses set offer_status = 'interview'   where offer_status = 'entrevista';
update public.analyses set offer_status = 'offer'       where offer_status = 'oferta';
update public.analyses set offer_status = 'rejected'    where offer_status = 'rechazado';
update public.analyses set offer_status = 'discarded'   where offer_status = 'descartado';

-- 3. Update follow_ups.status
update public.follow_ups set status = 'interesting' where status = 'interesante';
update public.follow_ups set status = 'applied'     where status = 'aplicado';
update public.follow_ups set status = 'interview'   where status = 'entrevista';
update public.follow_ups set status = 'offer'       where status = 'oferta';
update public.follow_ups set status = 'rejected'    where status = 'rechazado';
update public.follow_ups set status = 'discarded'   where status = 'descartado';

-- 4. Re-add constraints with English values
alter table public.analyses
  add constraint analyses_offer_status_check
  check (
    offer_status is null
    or offer_status in (
      'interesting',
      'applied',
      'interview',
      'offer',
      'rejected',
      'discarded'
    )
  );

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

-- 5. Update default
alter table public.analyses
  alter column offer_status set default 'interesting';

alter table public.follow_ups
  alter column status set default 'interesting';
