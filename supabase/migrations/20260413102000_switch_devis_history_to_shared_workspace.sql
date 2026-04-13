alter table public.devis_history
  add column if not exists workspace_id text;

update public.devis_history
set workspace_id = coalesce(workspace_id, 'oko-shared')
where workspace_id is null;

alter table public.devis_history
  alter column workspace_id set not null;

alter table public.devis_history
  drop constraint if exists devis_history_pkey;

alter table public.devis_history
  add constraint devis_history_pkey primary key (workspace_id, devis_id);

drop index if exists devis_history_user_saved_at_idx;

create index if not exists devis_history_workspace_saved_at_idx
  on public.devis_history (workspace_id, saved_at desc);

alter table public.devis_history
  alter column user_id drop not null;

alter table public.devis_history
  drop constraint if exists devis_history_user_id_fkey;

drop policy if exists "devis_history_select_own" on public.devis_history;
drop policy if exists "devis_history_insert_own" on public.devis_history;
drop policy if exists "devis_history_delete_own" on public.devis_history;

create policy "devis_history_select_shared"
  on public.devis_history
  for select
  to anon, authenticated
  using (workspace_id = 'oko-shared');

create policy "devis_history_insert_shared"
  on public.devis_history
  for insert
  to anon, authenticated
  with check (workspace_id = 'oko-shared');

create policy "devis_history_delete_shared"
  on public.devis_history
  for delete
  to anon, authenticated
  using (workspace_id = 'oko-shared');
