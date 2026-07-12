create table if not exists assinaturas (
  email text primary key,
  status text not null default 'ativa',
  atualizado_em timestamptz not null default now()
);
alter table assinaturas enable row level security;
create policy "usuario le a propria assinatura" on assinaturas for select using (email = auth.jwt() ->> 'email');
insert into assinaturas (email, status, atualizado_em)
select email, 'ativa', now() from auth.users on conflict (email) do nothing;
