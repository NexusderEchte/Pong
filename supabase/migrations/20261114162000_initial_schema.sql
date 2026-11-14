create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  score integer not null
);

alter table public.users enable row level security;
alter table public.games enable row level security;

create policy "Users can manage their own user record"
on public.users
for all
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Authenticated users can read all game records"
on public.games
for select
to authenticated
using (true);

create policy "Users can insert their own game records"
on public.games
for insert
to authenticated
with check (
  exists (
    select 1
    from public.users
    where users.id = (select auth.uid())
      and users.username = games.username
  )
);

create policy "Users can update their own game records"
on public.games
for update
to authenticated
using (
  exists (
    select 1
    from public.users
    where users.id = (select auth.uid())
      and users.username = games.username
  )
)
with check (
  exists (
    select 1
    from public.users
    where users.id = (select auth.uid())
      and users.username = games.username
  )
);

create policy "Users can delete their own game records"
on public.games
for delete
to authenticated
using (
  exists (
    select 1
    from public.users
    where users.id = (select auth.uid())
      and users.username = games.username
  )
);
