-- Run this in the Supabase SQL editor to set up your database

-- Enable RLS on all tables (users only see their own data)

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  motivational_tone text default 'gentle',
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);


create table if not exists timers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  addiction_name text not null,
  started_at timestamptz not null,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table timers enable row level security;
create policy "Users can manage own timers" on timers for all using (auth.uid() = user_id);


create table if not exists relapses (
  id uuid default gen_random_uuid() primary key,
  timer_id uuid references timers(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade not null,
  days_clean_before int,
  trigger_category text,
  what_happened text,
  emotional_state text,
  need_being_met text,
  next_time_plan text,
  created_at timestamptz default now()
);
alter table relapses enable row level security;
create policy "Users can manage own relapses" on relapses for all using (auth.uid() = user_id);


create table if not exists trigger_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  trigger_category text,
  description text,
  emotional_state text,
  resisted boolean default true,
  what_helped text,
  created_at timestamptz default now()
);
alter table trigger_logs enable row level security;
create policy "Users can manage own trigger logs" on trigger_logs for all using (auth.uid() = user_id);


create table if not exists pledges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  pledge_text text,
  pledge_date date default current_date,
  created_at timestamptz default now(),
  unique (user_id, pledge_date)
);
alter table pledges enable row level security;
create policy "Users can manage own pledges" on pledges for all using (auth.uid() = user_id);


create table if not exists chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  messages jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table chat_sessions enable row level security;
create policy "Users can read own chat sessions" on chat_sessions for select using (auth.uid() = user_id);
create policy "Users can delete own chat sessions" on chat_sessions for delete using (auth.uid() = user_id);
-- Insert/update done via service role in edge function
-- Table-level grant required for the delete policy to take effect
grant delete on table chat_sessions to authenticated;
