-- Corrige acesso bloqueado para compradores cujo email de cadastro tem
-- capitalização diferente do email usado na compra (Kiwify sempre envia o
-- email em minúsculas). A policy antiga comparava os emails com igualdade
-- exata, então "Nome@Gmail.com" (cadastro) x "nome@gmail.com" (compra) não
-- batiam e o usuário nunca via a própria assinatura.
drop policy if exists "usuario le a propria assinatura" on assinaturas;
create policy "usuario le a propria assinatura" on assinaturas
  for select using (lower(email) = lower(auth.jwt() ->> 'email'));
