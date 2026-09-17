import { createClient } from "@supabase/supabase-js";

// Cliente Supabase único e compartilhado. Os dois produtos (MMA Field e
// Pequenos da Fé Kids) usam o mesmo projeto Supabase — mesmo login de
// usuários — mas cada um checa sua própria tabela de assinatura
// (`assinaturas` vs `assinaturas_pequenos_da_fe`), então comprar um produto
// nunca libera o outro.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
