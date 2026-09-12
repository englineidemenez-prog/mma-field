"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePregnancyData } from "@/lib/hooks/usePregnancyData";
import { getRepo } from "@/lib/data/repo";
import { layetteSummary } from "@/lib/domain/layette";
import { LAYETTE_CATEGORY_LABELS, type LayetteCategoryKey, type LayetteItemTemplate, type UserLayetteItem } from "@/lib/types";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { LayetteItemRow } from "@/components/LayetteItemRow";
import { ProductRecommendationsModal } from "@/components/ProductRecommendationsModal";

const CATEGORY_ORDER = Object.keys(LAYETTE_CATEGORY_LABELS) as LayetteCategoryKey[];

export default function LayettePage() {
  const { user } = useAuth();
  const { profile } = usePregnancyData();
  const [items, setItems] = useState<LayetteItemTemplate[]>([]);
  const [userItems, setUserItems] = useState<Record<string, UserLayetteItem>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<LayetteCategoryKey>>(new Set());
  const [productsForItem, setProductsForItem] = useState<LayetteItemTemplate | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const repo = getRepo();
      const [itemTemplates, userLayette] = await Promise.all([repo.getLayetteItems(), repo.getUserLayetteItems(user.id)]);
      if (!active) return;
      setItems(itemTemplates);
      setUserItems(userLayette);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const summary = useMemo(() => layetteSummary(items, userItems), [items, userItems]);

  const byCategory = useMemo(() => {
    const grouped = new Map<LayetteCategoryKey, LayetteItemTemplate[]>();
    for (const cat of CATEGORY_ORDER) grouped.set(cat, []);
    for (const item of items) grouped.get(item.category)?.push(item);
    return grouped;
  }, [items]);

  function toggleCategory(cat: LayetteCategoryKey) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  async function updateItem(itemId: string, patch: Partial<UserLayetteItem>) {
    if (!user) return;
    setUserItems((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] ?? { itemId, ownedQty: 0, haveEnough: false, notNeeded: false, notes: null }),
        ...patch,
      },
    }));
    await getRepo().updateLayetteItem(user.id, itemId, patch);
  }

  function handleSetStatus(item: LayetteItemTemplate, status: "haveEnough" | "stillNeeded" | "notNeeded") {
    if (status === "haveEnough") updateItem(item.id, { haveEnough: true, notNeeded: false });
    else if (status === "notNeeded") updateItem(item.id, { notNeeded: true, haveEnough: false });
    else updateItem(item.id, { haveEnough: false, notNeeded: false });
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <span className="text-3xl">🤰</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-6 py-8">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-foreground">Meu Enxoval</h1>
        <p className="mt-1 text-sm text-muted">Acompanhe o que já foi preparado para a chegada do bebê.</p>
      </header>

      <Card>
        <p className="text-sm font-medium text-foreground">
          {summary.totalOwned} de {summary.totalRecommended} itens preparados
        </p>
        <div className="mt-3">
          <ProgressBar percent={summary.percent} colorClassName="bg-success" trackClassName="bg-success-light" />
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        {CATEGORY_ORDER.map((cat) => {
          const catItems = byCategory.get(cat) ?? [];
          if (catItems.length === 0) return null;
          const catSummary = layetteSummary(catItems, userItems);
          const info = LAYETTE_CATEGORY_LABELS[cat];
          const isOpen = expanded.has(cat);
          return (
            <div key={cat}>
              <button
                onClick={() => toggleCategory(cat)}
                className="flex w-full items-center justify-between rounded-2xl bg-surface px-4 py-3.5 shadow-[0_2px_16px_rgba(58,46,53,0.06)]"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span className="text-lg">{info.icon}</span> {info.label}
                </span>
                <span className="flex items-center gap-2 text-xs text-muted">
                  {catSummary.totalOwned}/{catSummary.totalRecommended}
                  <span>{isOpen ? "▲" : "▼"}</span>
                </span>
              </button>
              {isOpen && (
                <div className="mt-2.5 flex flex-col gap-2.5">
                  {catItems.map((item) => (
                    <LayetteItemRow
                      key={item.id}
                      item={item}
                      userItem={userItems[item.id]}
                      onChangeQty={(qty) => updateItem(item.id, { ownedQty: qty, haveEnough: qty >= item.recommendedQty })}
                      onSetStatus={(status) => handleSetStatus(item, status)}
                      onOpenProducts={() => setProductsForItem(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {productsForItem && user && (
        <ProductRecommendationsModal
          itemId={productsForItem.id}
          itemName={productsForItem.name}
          userId={user.id}
          countryCode={profile?.country ?? null}
          onClose={() => setProductsForItem(null)}
        />
      )}
    </div>
  );
}
