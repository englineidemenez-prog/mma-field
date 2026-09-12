import type { LayetteItemTemplate, UserLayetteItem } from "../types";

export function effectiveOwnedQty(item: LayetteItemTemplate, userItem: UserLayetteItem | undefined): number {
  if (!userItem || userItem.notNeeded) return 0;
  if (userItem.haveEnough) return item.recommendedQty;
  return Math.min(userItem.ownedQty, item.recommendedQty);
}

export function isItemComplete(item: LayetteItemTemplate, userItem: UserLayetteItem | undefined): boolean {
  if (userItem?.notNeeded) return true;
  return effectiveOwnedQty(item, userItem) >= item.recommendedQty;
}

/** Quantidade que ainda falta adquirir — 0 quando o item foi marcado como "não preciso". */
export function missingQty(item: LayetteItemTemplate, userItem: UserLayetteItem | undefined): number {
  if (userItem?.notNeeded) return 0;
  return Math.max(0, item.recommendedQty - effectiveOwnedQty(item, userItem));
}

export function layetteSummary(items: LayetteItemTemplate[], userItems: Record<string, UserLayetteItem>) {
  let totalRecommended = 0;
  let totalOwned = 0;
  for (const item of items) {
    if (userItems[item.id]?.notNeeded) continue;
    totalRecommended += item.recommendedQty;
    totalOwned += effectiveOwnedQty(item, userItems[item.id]);
  }
  const percent = totalRecommended === 0 ? 0 : Math.round((totalOwned / totalRecommended) * 100);
  return { totalRecommended, totalOwned, percent };
}
