import type {
  ChecklistTaskTemplate,
  LayetteItemTemplate,
  PregnancyProfile,
  ProductRecommendation,
  UserLayetteItem,
  UserTask,
} from "../types";
import { getSupabaseBrowserClient } from "../supabase/client";
import type { DataRepo } from "./repo";

function db() {
  return getSupabaseBrowserClient();
}

function toProfile(row: Record<string, unknown>): PregnancyProfile {
  return {
    userId: row.user_id as string,
    dueDate: (row.due_date as string) ?? null,
    lastPeriodDate: (row.last_period_date as string) ?? null,
    isFirstPregnancy: (row.is_first_pregnancy as boolean) ?? null,
    country: (row.country as string) ?? null,
    onboardingCompletedAt: (row.onboarding_completed_at as string) ?? null,
    notificationsEnabled: (row.notifications_enabled as boolean) ?? true,
  };
}

function toTaskTemplate(row: Record<string, unknown>): ChecklistTaskTemplate {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    category: row.category as ChecklistTaskTemplate["category"],
    startWeek: row.start_week as number,
    endWeek: row.end_week as number,
    priority: row.priority as ChecklistTaskTemplate["priority"],
  };
}

function toLayetteItem(row: Record<string, unknown>): LayetteItemTemplate {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category_id as LayetteItemTemplate["category"],
    recommendedQty: row.recommended_qty as number,
    notes: (row.notes as string) ?? undefined,
  };
}

function toProduct(row: Record<string, unknown>): ProductRecommendation {
  return {
    id: row.id as string,
    layetteItemId: (row.layette_item_id as string) ?? null,
    productName: row.product_name as string,
    productDescription: row.product_description as string,
    productImageUrl: (row.product_image_url as string) ?? null,
    category: row.category as ProductRecommendation["category"],
    countryCode: row.country_code as string,
    storeName: row.store_name as string,
    storeLogoUrl: (row.store_logo_url as string) ?? null,
    regularProductUrl: (row.regular_product_url as string) ?? null,
    affiliateUrl: (row.affiliate_url as string) ?? null,
    currency: row.currency as string,
    price: row.price === null || row.price === undefined ? null : Number(row.price),
    priority: row.priority as ProductRecommendation["priority"],
    isActive: Boolean(row.is_active),
    isPlaceholder: Boolean(row.is_placeholder),
  };
}

export const supabaseRepo: DataRepo = {
  async getProfile(userId) {
    const { data, error } = await db().from("pregnancy_profiles").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data ? toProfile(data) : null;
  },

  async saveProfile(userId, patch) {
    const payload: Record<string, unknown> = { user_id: userId };
    if (patch.dueDate !== undefined) payload.due_date = patch.dueDate;
    if (patch.lastPeriodDate !== undefined) payload.last_period_date = patch.lastPeriodDate;
    if (patch.isFirstPregnancy !== undefined) payload.is_first_pregnancy = patch.isFirstPregnancy;
    if (patch.country !== undefined) payload.country = patch.country;
    if (patch.onboardingCompletedAt !== undefined) payload.onboarding_completed_at = patch.onboardingCompletedAt;
    if (patch.notificationsEnabled !== undefined) payload.notifications_enabled = patch.notificationsEnabled;

    const { data, error } = await db()
      .from("pregnancy_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .single();
    if (error) throw error;
    return toProfile(data);
  },

  async getChecklistTasks() {
    const { data, error } = await db().from("checklist_tasks").select("*").order("start_week");
    if (error) throw error;
    return (data ?? []).map(toTaskTemplate);
  },

  async getUserTasks(userId) {
    const { data, error } = await db().from("user_tasks").select("*").eq("user_id", userId);
    if (error) throw error;
    const map: Record<string, UserTask> = {};
    for (const row of data ?? []) {
      map[row.task_id as string] = {
        taskId: row.task_id as string,
        status: row.status as UserTask["status"],
        completedAt: (row.completed_at as string) ?? null,
      };
    }
    return map;
  },

  async setTaskStatus(userId, taskId, status) {
    const { error } = await db()
      .from("user_tasks")
      .upsert(
        {
          user_id: userId,
          task_id: taskId,
          status,
          completed_at: status === "concluida" ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,task_id" },
      );
    if (error) throw error;
  },

  async getLayetteItems() {
    const { data, error } = await db().from("layette_items").select("*");
    if (error) throw error;
    return (data ?? []).map(toLayetteItem);
  },

  async getUserLayetteItems(userId) {
    const { data, error } = await db().from("user_layette_items").select("*").eq("user_id", userId);
    if (error) throw error;
    const map: Record<string, UserLayetteItem> = {};
    for (const row of data ?? []) {
      map[row.item_id as string] = {
        itemId: row.item_id as string,
        ownedQty: row.owned_qty as number,
        haveEnough: Boolean(row.have_enough),
        notNeeded: Boolean(row.not_needed),
        notes: (row.notes as string) ?? null,
      };
    }
    return map;
  },

  async updateLayetteItem(userId, itemId, patch) {
    const payload: Record<string, unknown> = { user_id: userId, item_id: itemId };
    if (patch.ownedQty !== undefined) payload.owned_qty = patch.ownedQty;
    if (patch.haveEnough !== undefined) payload.have_enough = patch.haveEnough;
    if (patch.notNeeded !== undefined) payload.not_needed = patch.notNeeded;
    if (patch.notes !== undefined) payload.notes = patch.notes;

    const { error } = await db().from("user_layette_items").upsert(payload, { onConflict: "user_id,item_id" });
    if (error) throw error;
  },

  async getProducts() {
    const { data, error } = await db().from("product_recommendations").select("*");
    if (error) throw error;
    return (data ?? []).map(toProduct);
  },

  async getActiveProductsForItem(itemId, countryCode) {
    const countries = countryCode ? [countryCode, "*"] : ["*"];
    const { data, error } = await db()
      .from("product_recommendations")
      .select("*")
      .eq("layette_item_id", itemId)
      .eq("is_active", true)
      .in("country_code", countries)
      .order("priority");
    if (error) throw error;
    return (data ?? []).map(toProduct);
  },

  async registerProductClick(userId, productRecommendationId, countryCode) {
    const { error } = await db().from("product_clicks").insert({
      user_id: userId,
      product_recommendation_id: productRecommendationId,
      country_code: countryCode,
    });
    if (error) throw error;
  },

  async getUserBudget(userId) {
    const { data, error } = await db().from("user_budget").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data ? { plannedTotal: Number(data.planned_total) } : null;
  },

  async saveUserBudget(userId, plannedTotal) {
    const { error } = await db()
      .from("user_budget")
      .upsert({ user_id: userId, planned_total: plannedTotal }, { onConflict: "user_id" });
    if (error) throw error;
  },

  async getBudgetItems(userId) {
    const { data, error } = await db().from("budget_items").select("*").eq("user_id", userId).order("created_at");
    if (error) throw error;
    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      categoryId: row.category_id as string,
      name: row.name as string,
      amount: Number(row.amount),
    }));
  },

  async addBudgetItem(userId, item) {
    const { data, error } = await db()
      .from("budget_items")
      .insert({ user_id: userId, category_id: item.categoryId, name: item.name, amount: item.amount })
      .select("*")
      .single();
    if (error) throw error;
    return { id: data.id as string, categoryId: data.category_id as string, name: data.name as string, amount: Number(data.amount) };
  },

  async removeBudgetItem(userId, id) {
    const { error } = await db().from("budget_items").delete().eq("user_id", userId).eq("id", id);
    if (error) throw error;
  },
};
