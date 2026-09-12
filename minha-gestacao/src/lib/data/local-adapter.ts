import type {
  PregnancyProfile,
  ProductClick,
  UserBudget,
  UserBudgetItem,
  UserLayetteItem,
  UserTask,
} from "../types";
import { CHECKLIST_TASKS } from "../seed/checklist";
import { LAYETTE_ITEMS } from "../seed/layette";
import { PRODUCT_RECOMMENDATIONS } from "../seed/products";
import { readJSON, writeJSON } from "./local-storage";
import type { DataRepo } from "./repo";

function profileKey(userId: string) {
  return `profile_${userId}`;
}
function tasksKey(userId: string) {
  return `user_tasks_${userId}`;
}
function layetteKey(userId: string) {
  return `user_layette_${userId}`;
}
function budgetKey(userId: string) {
  return `user_budget_${userId}`;
}
function budgetItemsKey(userId: string) {
  return `budget_items_${userId}`;
}
function clicksKey(userId: string) {
  return `product_clicks_${userId}`;
}

export const localRepo: DataRepo = {
  async getProfile(userId) {
    return readJSON<PregnancyProfile | null>(profileKey(userId), null);
  },

  async saveProfile(userId, patch) {
    const current = readJSON<PregnancyProfile | null>(profileKey(userId), null);
    const next: PregnancyProfile = {
      userId,
      dueDate: null,
      lastPeriodDate: null,
      isFirstPregnancy: null,
      country: null,
      onboardingCompletedAt: null,
      notificationsEnabled: true,
      ...current,
      ...patch,
    };
    writeJSON(profileKey(userId), next);
    return next;
  },

  async getChecklistTasks() {
    return CHECKLIST_TASKS;
  },

  async getUserTasks(userId) {
    return readJSON<Record<string, UserTask>>(tasksKey(userId), {});
  },

  async setTaskStatus(userId, taskId, status) {
    const tasks = readJSON<Record<string, UserTask>>(tasksKey(userId), {});
    tasks[taskId] = {
      taskId,
      status,
      completedAt: status === "concluida" ? new Date().toISOString() : null,
    };
    writeJSON(tasksKey(userId), tasks);
  },

  async getLayetteItems() {
    return LAYETTE_ITEMS;
  },

  async getUserLayetteItems(userId) {
    return readJSON<Record<string, UserLayetteItem>>(layetteKey(userId), {});
  },

  async updateLayetteItem(userId, itemId, patch) {
    const items = readJSON<Record<string, UserLayetteItem>>(layetteKey(userId), {});
    const current: UserLayetteItem = items[itemId] ?? {
      itemId,
      ownedQty: 0,
      haveEnough: false,
      notNeeded: false,
      notes: null,
    };
    items[itemId] = { ...current, ...patch };
    writeJSON(layetteKey(userId), items);
  },

  async getProducts() {
    return PRODUCT_RECOMMENDATIONS;
  },

  async getActiveProductsForItem(itemId, countryCode) {
    return PRODUCT_RECOMMENDATIONS.filter(
      (p) =>
        p.isActive &&
        p.layetteItemId === itemId &&
        (p.countryCode === "*" || p.countryCode === countryCode),
    ).sort((a, b) => (a.priority === b.priority ? 0 : a.priority === "alta" ? -1 : 1));
  },

  async registerProductClick(userId, productRecommendationId, countryCode) {
    const clicks = readJSON<ProductClick[]>(clicksKey(userId), []);
    clicks.push({
      id: crypto.randomUUID(),
      userId,
      productRecommendationId,
      countryCode,
      clickedAt: new Date().toISOString(),
    });
    writeJSON(clicksKey(userId), clicks);
  },

  async getUserBudget(userId) {
    return readJSON<UserBudget | null>(budgetKey(userId), null);
  },

  async saveUserBudget(userId, plannedTotal) {
    writeJSON(budgetKey(userId), { plannedTotal });
  },

  async getBudgetItems(userId) {
    return readJSON<UserBudgetItem[]>(budgetItemsKey(userId), []);
  },

  async addBudgetItem(userId, item) {
    const items = readJSON<UserBudgetItem[]>(budgetItemsKey(userId), []);
    const newItem: UserBudgetItem = { ...item, id: crypto.randomUUID() };
    items.push(newItem);
    writeJSON(budgetItemsKey(userId), items);
    return newItem;
  },

  async removeBudgetItem(userId, id) {
    const items = readJSON<UserBudgetItem[]>(budgetItemsKey(userId), []);
    writeJSON(
      budgetItemsKey(userId),
      items.filter((i) => i.id !== id),
    );
  },
};
