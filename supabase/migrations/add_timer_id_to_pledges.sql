-- Add optional timer_id to pledges so pledges can be tied to a specific addiction

alter table pledges add column if not exists timer_id uuid references timers(id) on delete cascade;

-- Drop the old unique constraint (one pledge per day)
alter table pledges drop constraint if exists pledges_user_id_pledge_date_key;

-- One general pledge per day (timer_id is null)
create unique index if not exists pledges_general_unique
  on pledges (user_id, pledge_date)
  where timer_id is null;

-- One pledge per addiction per day
create unique index if not exists pledges_addiction_unique
  on pledges (user_id, pledge_date, timer_id)
  where timer_id is not null;
