"use client";

import { useEffect, useState } from "react";
import { getRepo } from "@/lib/data/repo";
import type { ProductRecommendation } from "@/lib/types";

function formatPrice(price: number | null, currency: string): string | null {
  if (price === null) return null;
  const locale = currency === "USD" ? "en-US" : currency === "EUR" ? "pt-PT" : "pt-BR";
  try {
    return price.toLocaleString(locale, { style: "currency", currency });
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

interface Props {
  itemId: string;
  itemName: string;
  userId: string;
  countryCode: string | null;
  onClose: () => void;
}

export function ProductRecommendationsModal({ itemId, itemName, userId, countryCode, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductRecommendation[]>([]);
  const [hasAnyForItem, setHasAnyForItem] = useState(false);
  const [unavailableId, setUnavailableId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const repo = getRepo();
      const [matched, all] = await Promise.all([repo.getActiveProductsForItem(itemId, countryCode), repo.getProducts()]);
      if (!active) return;
      setProducts(matched.slice(0, 5));
      setHasAnyForItem(all.some((p) => p.layetteItemId === itemId && p.isActive));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [itemId, countryCode]);

  async function handleViewInStore(product: ProductRecommendation) {
    const url = product.affiliateUrl || product.regularProductUrl;
    if (!url) {
      setUnavailableId(product.id);
      return;
    }
    await getRepo().registerProductClick(userId, product.id, countryCode);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-background px-6 pb-8 pt-3"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl text-foreground">Produtos recomendados</h2>
            <p className="mt-1 text-sm text-muted">
              Selecionamos algumas opções para ajudar você a completar seu enxoval em <strong>{itemName}</strong>.
            </p>
          </div>
          <button onClick={onClose} className="ml-3 shrink-0 rounded-full bg-surface px-3 py-1.5 text-sm text-muted">
            Fechar
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {loading && <p className="text-sm text-muted">Carregando opções…</p>}

          {!loading && products.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface px-5 py-8 text-center">
              <span className="text-3xl">🛍️</span>
              {hasAnyForItem ? (
                <>
                  <p className="text-sm font-medium text-foreground">Estamos preparando recomendações para sua região.</p>
                  <p className="text-xs text-muted">Em breve teremos opções disponíveis para o seu país.</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">Ainda não temos recomendações para este item.</p>
                  <p className="text-xs text-muted">Estamos preparando opções para você.</p>
                </>
              )}
            </div>
          )}

          {products.map((product) => {
            const price = formatPrice(product.price, product.currency);
            return (
              <div key={product.id} className="rounded-3xl bg-surface p-4 shadow-[0_2px_16px_rgba(58,46,53,0.06)]">
                <div className="flex gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent-light text-2xl">
                    🛍️
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-foreground">{product.productName}</p>
                      {product.isPlaceholder && (
                        <span className="shrink-0 rounded-full bg-accent-light px-1.5 py-0.5 text-[10px] text-accent">
                          exemplo
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted">{product.productDescription}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                      <span>{product.storeName}</span>
                      {price && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-foreground">{price}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {unavailableId === product.id ? (
                  <p className="mt-3 rounded-2xl bg-primary-light px-3 py-2 text-xs text-primary-dark">
                    Esta recomendação ainda não está disponível para sua região.
                  </p>
                ) : (
                  <button
                    onClick={() => handleViewInStore(product)}
                    className="mt-3 w-full rounded-2xl bg-primary py-2.5 text-sm font-medium text-white"
                  >
                    🛍️ Ver na loja
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
