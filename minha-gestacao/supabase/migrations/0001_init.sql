-- Minha Gestação — schema inicial
-- Convenções:
--   * Tabelas "de conteúdo" (checklist_tasks, layette_categories, layette_items,
--     product_recommendations, budget_categories) são catálogos globais, com
--     leitura pública e escrita restrita — pensadas para futuramente serem
--     editadas por uma área administrativa (role "admin").
--   * Tabelas "do usuário" (pregnancy_profiles, user_tasks, user_layette_items,
--     user_budget, budget_items) guardam dados pessoais e são protegidas por
--     RLS: cada usuária só acessa as próprias linhas.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Perfil de gestação (1:1 com auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.pregnancy_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  due_date date,
  last_period_date date,
  is_first_pregnancy boolean,
  country text,
  onboarding_completed_at timestamptz,
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint has_due_date_or_last_period check (due_date is not null or last_period_date is not null or onboarding_completed_at is null)
);

alter table public.pregnancy_profiles enable row level security;

create policy "profiles: select own" on public.pregnancy_profiles
  for select using (auth.uid() = user_id);
create policy "profiles: insert own" on public.pregnancy_profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles: update own" on public.pregnancy_profiles
  for update using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Checklist (catálogo + progresso da usuária)
-- ---------------------------------------------------------------------------
create table if not exists public.checklist_tasks (
  id text primary key,
  title text not null,
  description text not null,
  category text not null check (category in ('organizacao', 'enxoval', 'financeiro', 'maternidade', 'casa', 'documentos')),
  start_week smallint not null,
  end_week smallint not null,
  priority text not null check (priority in ('alta', 'media', 'baixa')),
  created_at timestamptz not null default now()
);

alter table public.checklist_tasks enable row level security;
create policy "checklist_tasks: public read" on public.checklist_tasks
  for select using (true);

create table if not exists public.user_tasks (
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id text not null references public.checklist_tasks (id) on delete cascade,
  status text not null default 'pendente' check (status in ('pendente', 'concluida')),
  completed_at timestamptz,
  primary key (user_id, task_id)
);

alter table public.user_tasks enable row level security;
create policy "user_tasks: manage own" on public.user_tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Enxoval (catálogo + progresso da usuária)
-- ---------------------------------------------------------------------------
create table if not exists public.layette_categories (
  id text primary key,
  label text not null,
  icon text not null,
  sort_order smallint not null default 0
);

alter table public.layette_categories enable row level security;
create policy "layette_categories: public read" on public.layette_categories
  for select using (true);

create table if not exists public.layette_items (
  id text primary key,
  category_id text not null references public.layette_categories (id) on delete restrict,
  name text not null,
  recommended_qty smallint not null default 1,
  notes text
);

alter table public.layette_items enable row level security;
create policy "layette_items: public read" on public.layette_items
  for select using (true);

create table if not exists public.user_layette_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id text not null references public.layette_items (id) on delete cascade,
  owned_qty smallint not null default 0,
  have_enough boolean not null default false,
  notes text,
  primary key (user_id, item_id)
);

alter table public.user_layette_items enable row level security;
create policy "user_layette_items: manage own" on public.user_layette_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Produtos recomendados (catálogo global — apenas leitura para a usuária)
-- ---------------------------------------------------------------------------
create table if not exists public.product_recommendations (
  id text primary key,
  layette_item_id text references public.layette_items (id) on delete set null,
  name text not null,
  category text not null,
  country text not null default '*',
  external_url text not null,
  affiliate_url text,
  image_url text,
  short_description text not null,
  price_range text,
  priority text not null default 'media' check (priority in ('alta', 'media', 'baixa')),
  is_placeholder boolean not null default true
);

alter table public.product_recommendations enable row level security;
create policy "product_recommendations: public read" on public.product_recommendations
  for select using (true);

-- ---------------------------------------------------------------------------
-- Planejamento financeiro
-- ---------------------------------------------------------------------------
create table if not exists public.budget_categories (
  id text primary key,
  name text not null,
  icon text not null
);

alter table public.budget_categories enable row level security;
create policy "budget_categories: public read" on public.budget_categories
  for select using (true);

create table if not exists public.user_budget (
  user_id uuid primary key references auth.users (id) on delete cascade,
  planned_total numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.user_budget enable row level security;
create policy "user_budget: manage own" on public.user_budget
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id text not null references public.budget_categories (id) on delete restrict,
  name text not null,
  amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.budget_items enable row level security;
create policy "budget_items: manage own" on public.budget_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Índices de apoio
-- ---------------------------------------------------------------------------
create index if not exists idx_user_tasks_user on public.user_tasks (user_id);
create index if not exists idx_user_layette_items_user on public.user_layette_items (user_id);
create index if not exists idx_budget_items_user on public.budget_items (user_id);
create index if not exists idx_checklist_tasks_week on public.checklist_tasks (start_week, end_week);
create index if not exists idx_product_recommendations_layette_item on public.product_recommendations (layette_item_id);
