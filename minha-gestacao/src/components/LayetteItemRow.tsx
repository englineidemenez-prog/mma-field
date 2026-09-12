import type { LayetteItemTemplate, UserLayetteItem } from "@/lib/types";
import { effectiveOwnedQty, missingQty } from "@/lib/domain/layette";

export function LayetteItemRow({
  item,
  userItem,
  onChangeQty,
  onSetStatus,
  onOpenProducts,
}: {
  item: LayetteItemTemplate;
  userItem: UserLayetteItem | undefined;
  onChangeQty: (nextQty: number) => void;
  onSetStatus: (status: "haveEnough" | "stillNeeded" | "notNeeded") => void;
  onOpenProducts: () => void;
}) {
  const owned = effectiveOwnedQty(item, userItem);
  const missing = missingQty(item, userItem);
  const haveEnough = userItem?.haveEnough ?? false;
  const notNeeded = userItem?.notNeeded ?? false;
  const rawQty = userItem?.ownedQty ?? 0;
  const qtyLocked = haveEnough || notNeeded;

  return (
    <div className={`rounded-2xl bg-surface px-4 py-3.5 shadow-[0_2px_16px_rgba(58,46,53,0.06)] ${notNeeded ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{item.name}</p>
          <p className="mt-0.5 text-xs text-muted">Recomendado: {item.recommendedQty} unidades</p>
        </div>
        {!notNeeded && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              missing === 0 ? "bg-success-light text-success" : "bg-primary-light text-primary-dark"
            }`}
          >
            {missing === 0 ? "Completo" : `Faltam ${missing}`}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => onChangeQty(Math.max(0, rawQty - 1))}
          disabled={qtyLocked}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light text-accent disabled:opacity-40"
          aria-label="Diminuir quantidade"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-medium text-foreground">{qtyLocked ? owned : rawQty}</span>
        <button
          onClick={() => onChangeQty(rawQty + 1)}
          disabled={qtyLocked}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light text-accent disabled:opacity-40"
          aria-label="Aumentar quantidade"
        >
          +
        </button>
      </div>

      <div className="mt-3 flex gap-1.5 rounded-2xl bg-background p-1 text-[11px]">
        {[
          { key: "haveEnough" as const, label: "✓ Já tenho", active: haveEnough },
          { key: "stillNeeded" as const, label: "Ainda preciso", active: !haveEnough && !notNeeded },
          { key: "notNeeded" as const, label: "Não preciso", active: notNeeded },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => onSetStatus(opt.key)}
            className={`flex-1 rounded-xl py-1.5 font-medium transition-colors ${
              opt.active ? "bg-surface text-primary-dark shadow-sm" : "text-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {missing > 0 && !notNeeded && (
        <button
          onClick={onOpenProducts}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-medium text-white"
        >
          🛍️ Ver produtos recomendados
        </button>
      )}
    </div>
  );
}
