-- Evolui o catálogo de produtos recomendados para suportar monetização
-- futura (links de afiliado por loja/país) e registra cliques para análise.
-- Tudo aditivo/renomeação — nenhuma tabela existente é removida.

alter table public.product_recommendations rename column name to product_name;
alter table public.product_recommendations rename column short_description to product_description;
alter table public.product_recommendations rename column image_url to product_image_url;
alter table public.product_recommendations rename column country to country_code;
alter table public.product_recommendations rename column external_url to regular_product_url;

alter table public.product_recommendations
  add column if not exists store_name text not null default 'Loja Exemplo',
  add column if not exists store_logo_url text,
  add column if not exists currency text not null default 'BRL',
  add column if not exists price numeric(12, 2),
  add column if not exists is_active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

alter table public.product_recommendations drop column if exists price_range;

create index if not exists idx_product_recommendations_country on public.product_recommendations (country_code);
create index if not exists idx_product_recommendations_active on public.product_recommendations (is_active);

-- ---------------------------------------------------------------------------
-- Status "não preciso" por item do enxoval (além de "já tenho" / "ainda preciso")
-- ---------------------------------------------------------------------------
alter table public.user_layette_items add column if not exists not_needed boolean not null default false;

-- ---------------------------------------------------------------------------
-- Registro de cliques em produtos recomendados (para análises futuras)
-- ---------------------------------------------------------------------------
create table if not exists public.product_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_recommendation_id text not null references public.product_recommendations (id) on delete cascade,
  country_code text,
  clicked_at timestamptz not null default now()
);

alter table public.product_clicks enable row level security;

-- Cliques são imutáveis (registro de análise): sem policy de update/delete.
create policy "product_clicks: insert own" on public.product_clicks
  for insert with check (auth.uid() = user_id);
create policy "product_clicks: select own" on public.product_clicks
  for select using (auth.uid() = user_id);

create index if not exists idx_product_clicks_product on public.product_clicks (product_recommendation_id);
create index if not exists idx_product_clicks_country on public.product_clicks (country_code);
