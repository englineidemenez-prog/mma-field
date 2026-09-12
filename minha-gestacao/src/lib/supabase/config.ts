export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Enquanto o projeto Supabase não é configurado (.env), o app roda em modo
 * demo: autenticação e dados ficam em localStorage, usando o mesmo conteúdo
 * semente que seria inserido no banco. Isso permite testar o fluxo inteiro
 * sem depender de um backend externo.
 */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
