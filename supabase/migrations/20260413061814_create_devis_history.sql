create table if not exists public.devis_history (
  user_id uuid not null references auth.users (id) on delete cascade,
  devis_id text not null,
  devis jsonb not null,
  saved_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, devis_id)
);

create index if not exists devis_history_user_saved_at_idx
  on public.devis_history (user_id, saved_at desc);

alter table public.devis_history enable row level security;

create policy "devis_history_select_own"
  on public.devis_history
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "devis_history_insert_own"
  on public.devis_history
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "devis_history_delete_own"
  on public.devis_history
  for delete
  to authenticated
  using (auth.uid() = user_id);
