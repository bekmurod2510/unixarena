-- =========================================================
-- UnixArena: initial schema
-- =========================================================

-- ---------- Enums ----------
create type public.difficulty as enum ('beginner', 'intermediate', 'advanced');
create type public.friendship_status as enum ('pending', 'accepted', 'blocked');
create type public.race_status as enum ('waiting', 'in_progress', 'finished', 'cancelled');

-- ---------- Identity ----------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text not null unique check (char_length(username) between 3 and 20),
  avatar_url    text,
  xp            integer not null default 0 check (xp >= 0),
  streak_days   integer not null default 0 check (streak_days >= 0),
  last_active   date,
  elo           integer not null default 1000,
  created_at    timestamptz not null default now()
);

-- ---------- Content ----------
create table public.modules (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text,
  order_index  integer not null
);

create table public.challenges (
  id              uuid primary key default gen_random_uuid(),
  module_id       uuid not null references public.modules(id) on delete cascade,
  slug            text not null unique,
  title           text not null,
  description     text not null,
  difficulty      public.difficulty not null default 'beginner',
  xp_reward       integer not null default 10 check (xp_reward > 0),
  validator_type  text not null default 'flag',
  order_index     integer not null default 0,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Server-only data (flags, validation rules). No client access, ever.
create table public.challenge_secrets (
  challenge_id      uuid primary key references public.challenges(id) on delete cascade,
  validator_config  jsonb not null
);

-- ---------- Progress ----------
create table public.attempts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  challenge_id   uuid not null references public.challenges(id) on delete cascade,
  started_at     timestamptz not null default now(),
  completed_at   timestamptz,
  success        boolean not null default false,
  command_count  integer not null default 0
);

create table public.command_logs (
  id          bigint generated always as identity primary key,
  attempt_id  uuid not null references public.attempts(id) on delete cascade,
  seq         integer not null,
  command     text not null,
  ts          timestamptz not null default now(),
  unique (attempt_id, seq)
);

-- ---------- Achievements ----------
create table public.achievements (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text not null,
  icon         text
);

create table public.user_achievements (
  user_id         uuid not null references public.profiles(id) on delete cascade,
  achievement_id  uuid not null references public.achievements(id) on delete cascade,
  earned_at       timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ---------- Social ----------
create table public.friendships (
  id            uuid primary key default gen_random_uuid(),
  requester_id  uuid not null references public.profiles(id) on delete cascade,
  addressee_id  uuid not null references public.profiles(id) on delete cascade,
  status        public.friendship_status not null default 'pending',
  created_at    timestamptz not null default now(),
  check (requester_id <> addressee_id),
  unique (requester_id, addressee_id)
);

-- ---------- Races ----------
create table public.races (
  id            uuid primary key default gen_random_uuid(),
  challenge_id  uuid not null references public.challenges(id),
  player_a      uuid not null references public.profiles(id),
  player_b      uuid not null references public.profiles(id),
  status        public.race_status not null default 'waiting',
  winner_id     uuid references public.profiles(id),
  elo_delta_a   integer,
  elo_delta_b   integer,
  started_at    timestamptz,
  finished_at   timestamptz,
  created_at    timestamptz not null default now(),
  check (player_a <> player_b)
);

-- Link attempts to races (null for normal solo practice)
alter table public.attempts
  add column race_id uuid references public.races(id) on delete set null;

-- ---------- Indexes on foreign keys / common lookups ----------
create index on public.challenges (module_id);
create index on public.attempts (user_id, challenge_id);
create index on public.attempts (race_id);
create index on public.command_logs (attempt_id);
create index on public.friendships (addressee_id);
create index on public.races (player_a);
create index on public.races (player_b);
create index on public.profiles (xp desc);
create index on public.profiles (elo desc);