// Tipos de domínio compartilhados entre os adapters (Supabase e local) e a UI.

export type Trimester = 1 | 2 | 3;

export interface PregnancyProfile {
  userId: string;
  dueDate: string | null; // ISO date (YYYY-MM-DD)
  lastPeriodDate: string | null; // ISO date, usado quando a usuária não sabe a DPP
  isFirstPregnancy: boolean | null;
  country: string | null;
  onboardingCompletedAt: string | null; // ISO datetime
  notificationsEnabled: boolean;
}

export type ChecklistCategory =
  | "organizacao"
  | "enxoval"
  | "financeiro"
  | "maternidade"
  | "casa"
  | "documentos";

export const CHECKLIST_CATEGORY_LABELS: Record<ChecklistCategory, { label: string; icon: string }> = {
  organizacao: { label: "Organização", icon: "📋" },
  enxoval: { label: "Enxoval", icon: "🛍️" },
  financeiro: { label: "Planejamento financeiro", icon: "💰" },
  maternidade: { label: "Maternidade", icon: "👜" },
  casa: { label: "Preparação da casa", icon: "🏠" },
  documentos: { label: "Documentos", icon: "📄" },
};

export type TaskPriority = "alta" | "media" | "baixa";

export interface ChecklistTaskTemplate {
  id: string;
  title: string;
  description: string;
  category: ChecklistCategory;
  startWeek: number; // semana inicial recomendada
  endWeek: number; // semana final recomendada
  priority: TaskPriority;
}

export type UserTaskStatus = "pendente" | "concluida";

export interface UserTask {
  taskId: string;
  status: UserTaskStatus;
  completedAt: string | null;
}

export type LayetteCategoryKey =
  | "roupas"
  | "banho_higiene"
  | "quarto"
  | "alimentacao"
  | "passeios"
  | "maternidade";

export const LAYETTE_CATEGORY_LABELS: Record<LayetteCategoryKey, { label: string; icon: string }> = {
  roupas: { label: "Roupas", icon: "👕" },
  banho_higiene: { label: "Banho e higiene", icon: "🛁" },
  quarto: { label: "Quarto", icon: "🛏️" },
  alimentacao: { label: "Alimentação", icon: "🍼" },
  passeios: { label: "Passeios", icon: "🚗" },
  maternidade: { label: "Maternidade", icon: "🏥" },
};

export interface LayetteItemTemplate {
  id: string;
  name: string;
  category: LayetteCategoryKey;
  recommendedQty: number;
  notes?: string;
}

export interface UserLayetteItem {
  itemId: string;
  ownedQty: number;
  haveEnough: boolean; // "Já tenho" marcado manualmente
  notNeeded: boolean; // "Não preciso deste item" — exclui o item do progresso
  notes: string | null;
}

/**
 * Catálogo global de produtos recomendados (leitura pública, escrita restrita
 * a uma futura área administrativa). Pensado para permitir múltiplas opções
 * por item do enxoval, por país/loja, e links de afiliado configuráveis.
 */
export interface ProductRecommendation {
  id: string;
  layetteItemId: string | null; // vínculo opcional com um item do enxoval
  productName: string;
  productDescription: string;
  productImageUrl: string | null;
  category: LayetteCategoryKey | ChecklistCategory | "geral";
  countryCode: string; // ISO 3166-1 alpha-2 (ex: "BR"), ou "*" para qualquer país
  storeName: string;
  storeLogoUrl: string | null;
  regularProductUrl: string | null;
  affiliateUrl: string | null; // usado com prioridade sobre regularProductUrl quando presente
  currency: string; // ISO 4217 (ex: "BRL", "USD")
  price: number | null;
  priority: TaskPriority;
  isActive: boolean;
  isPlaceholder: boolean; // sinaliza claramente exemplo/fictício no MVP
}

export interface ProductClick {
  id: string;
  userId: string;
  productRecommendationId: string;
  countryCode: string | null;
  clickedAt: string;
}

export interface BudgetCategoryTemplate {
  id: string;
  name: string;
  icon: string;
}

export interface UserBudget {
  plannedTotal: number;
}

export interface UserBudgetItem {
  id: string;
  categoryId: string;
  name: string;
  amount: number;
}
