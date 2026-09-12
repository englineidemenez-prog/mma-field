# Minha Gestação

App mobile-first (MVP) para ajudar gestantes a organizar a jornada da
gravidez: o que fazer em cada fase, preparação do enxoval, checklist
personalizado e produtos recomendados via links externos.

**Este app não é um substituto de acompanhamento médico.** O foco é
exclusivamente organização, planejamento e educação geral.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Supabase (Postgres + Auth) — com um **modo demo automático** em
  localStorage quando o Supabase não está configurado, para testar o app
  sem backend.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000 — sem nenhuma configuração adicional, o app já
funciona em **modo demo** (cadastro/login e dados salvos apenas no seu
navegador).

### Conectando a um projeto Supabase real

1. Crie um projeto em https://supabase.com.
2. Rode as migrations em `supabase/migrations/` **em ordem** (`0001_init.sql`,
   depois `0002_product_recommendations.sql`) via SQL Editor ou Supabase CLI,
   e depois `supabase/seed.sql` para popular o conteúdo inicial (tarefas do
   checklist, itens de enxoval, produtos de exemplo).
3. Copie `.env.example` para `.env.local` e preencha:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
4. Reinicie `npm run dev`. O app passa a usar o Supabase automaticamente
   (veja `src/lib/supabase/config.ts`).

## Arquitetura

- `src/lib/types.ts` — tipos de domínio compartilhados.
- `src/lib/pregnancy.ts` — cálculo puro da semana gestacional, dias
  restantes e progresso, a partir da DPP ou da DUM.
- `src/lib/seed/*.ts` — conteúdo inicial (checklist, enxoval, produtos,
  categorias de orçamento). É a mesma fonte usada pelo modo demo e pelo
  `supabase/seed.sql`.
- `src/lib/data/repo.ts` — interface única de acesso a dados
  (`getRepo()`), com duas implementações: `supabase-adapter.ts` (produção)
  e `local-adapter.ts` (modo demo). Trocar de uma para outra é automático,
  baseado nas variáveis de ambiente.
- `src/lib/auth/AuthContext.tsx` — autenticação (Supabase Auth ou sessão
  demo em localStorage), exposta via `useAuth()`.
- `src/app/onboarding` — wizard de 5 telas.
- `src/app/(app)/*` — telas principais (Hoje, Checklist, Enxoval, Jornada,
  Perfil), com navegação inferior fixa em `src/components/BottomNav.tsx`.

## Banco de dados (Supabase)

Ver `supabase/migrations/0001_init.sql`. Tabelas de conteúdo
(`checklist_tasks`, `layette_items`, `product_recommendations`,
`budget_categories`, `layette_categories`) são catálogos globais de
leitura pública — pensadas para futuramente serem editadas por uma área
administrativa. Tabelas por usuária (`pregnancy_profiles`, `user_tasks`,
`user_layette_items`, `user_budget`, `budget_items`) têm Row Level
Security: cada usuária só acessa os próprios dados (`auth.uid() =
user_id`).

## Produtos recomendados

Fluxo: Enxoval → item com quantidade faltante → "🛍️ Ver produtos
recomendados" → modal com 1 a 5 opções, filtradas pelo `country_code` do
perfil da usuária (produtos com `country_code = "*"` aparecem para
qualquer país; produtos de outro país nunca "vazam" automaticamente) →
"Ver na loja" abre `affiliate_url` (prioridade) ou `regular_product_url`,
registrando o clique em `product_clicks` antes de abrir o link. Sem link
configurado, mostra "Esta recomendação ainda não está disponível para sua
região." em vez de navegar.

Cada item do enxoval tem 3 estados: **Já tenho**, **Ainda preciso** (com
contador de quantidade) e **Não preciso** (exclui o item do progresso).

Os dados em `src/lib/seed/products.ts` (e no `seed.sql`) são **fictícios,
claramente marcados como exemplo** (`isPlaceholder: true`, `store_name:
"Loja Exemplo"`, URLs `exemplo.com`). Substitua por parceiros reais antes
de qualquer uso em produção — nenhum link de afiliado real foi incluído
automaticamente. A tabela já suporta múltiplas opções por item, por loja e
por país, para uma futura área administrativa gerenciar o catálogo
(criar/editar produtos, ativar/desativar, definir prioridade) sem mudanças
de código.

`product_clicks` registra cada clique em "Ver na loja" (usuária, produto,
país, data/hora) — pensado para análises futuras de interesse por produto
e por região; não há painel de analytics no MVP, apenas o registro.

## Fora do escopo deste MVP

Rede social, chat entre usuárias, marketplace próprio, telemedicina,
diagnóstico médico, integração bancária e IA complexa — conforme decidido
para a primeira versão.
