-- Tabela de assinaturas do produto "Pequenos da Fé Kids".
-- Propositalmente separada da tabela `assinaturas` (usada pelo MMA Field) para
-- que comprar um produto NUNCA libere acesso ao outro.
create table if not exists assinaturas_pequenos_da_fe (
  email text primary key,
  status text not null default 'ativa',
  atualizado_em timestamptz not null default now()
);
alter table assinaturas_pequenos_da_fe enable row level security;
create policy "usuario le a propria assinatura (pequenos da fe)" on assinaturas_pequenos_da_fe
  for select using (email = auth.jwt() ->> 'email');
