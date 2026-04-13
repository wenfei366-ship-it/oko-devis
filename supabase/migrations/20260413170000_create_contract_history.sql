create table if not exists public.contract_history (
  workspace_id text not null default 'oko-shared',
  contract_id text not null,
  devis_id text,
  contract jsonb not null,
  saved_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (workspace_id, contract_id)
);

create index if not exists contract_history_workspace_saved_at_idx
  on public.contract_history (workspace_id, saved_at desc);

create index if not exists contract_history_workspace_devis_idx
  on public.contract_history (workspace_id, devis_id);

alter table public.contract_history enable row level security;

create policy "contract_history_select_shared"
  on public.contract_history
  for select
  to anon, authenticated
  using (workspace_id = 'oko-shared');

create policy "contract_history_insert_shared"
  on public.contract_history
  for insert
  to anon, authenticated
  with check (workspace_id = 'oko-shared');

create policy "contract_history_update_shared"
  on public.contract_history
  for update
  to anon, authenticated
  using (workspace_id = 'oko-shared')
  with check (workspace_id = 'oko-shared');

create policy "contract_history_delete_shared"
  on public.contract_history
  for delete
  to anon, authenticated
  using (workspace_id = 'oko-shared');
