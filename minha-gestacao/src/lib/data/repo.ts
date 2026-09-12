import type {
  ChecklistTaskTemplate,
  LayetteItemTemplate,
  PregnancyProfile,
  ProductRecommendation,
  UserBudget,
  UserBudgetItem,
  UserLayetteItem,
  UserTask,
  UserTaskStatus,
} from "../types";
import { isSupabaseConfigured } from "../supabase/config";
import { localRepo } from "./local-adapter";
import { supabaseRepo } from "./supabase-adapter";

export interface DataRepo {
  getProfile(userId: string): Promise<PregnancyProfile | null>;
  saveProfile(userId: string, patch: Partial<Omit<PregnancyProfile, "userId">>): Promise<PregnancyProfile>;

  getChecklistTasks(): Promise<ChecklistTaskTemplate[]>;
  getUserTasks(userId: string): Promise<Record<string, UserTask>>;
  setTaskStatus(userId: string, taskId: string, status: UserTaskStatus): Promise<void>;

  getLayetteItems(): Promise<LayetteItemTemplate[]>;
  getUserLayetteItems(userId: string): Promise<Record<string, UserLayetteItem>>;
  updateLayetteItem(userId: string, itemId: string, patch: Partial<UserLayetteItem>): Promise<void>;

  getProducts(): Promise<ProductRecommendation[]>;
  /** Produtos ativos para um item do enxoval, priorizando o país informado (ou "*", universal). */
  getActiveProductsForItem(itemId: string, countryCode: string | null): Promise<ProductRecommendation[]>;
  /** Registra o clique em "Ver na loja", para análises futuras. */
  registerProductClick(userId: string, productRecommendationId: string, countryCode: string | null): Promise<void>;

  getUserBudget(userId: string): Promise<UserBudget | null>;
  saveUserBudget(userId: string, plannedTotal: number): Promise<void>;
  getBudgetItems(userId: string): Promise<UserBudgetItem[]>;
  addBudgetItem(userId: string, item: Omit<UserBudgetItem, "id">): Promise<UserBudgetItem>;
  removeBudgetItem(userId: string, id: string): Promise<void>;
}

/** Escolhe o adapter em runtime: Supabase quando configurado, senão modo local (demo). */
export function getRepo(): DataRepo {
  return isSupabaseConfigured() ? supabaseRepo : localRepo;
}
