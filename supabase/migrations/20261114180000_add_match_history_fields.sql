alter table public.games
  add column opponent text not null default 'SmashKing',
  add column opponent_score integer not null default 0,
  add column mode text not null default 'Friendly',
  add column created_at timestamptz not null default now();
