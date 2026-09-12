"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { getRepo } from "@/lib/data/repo";
import { BUDGET_CATEGORIES } from "@/lib/seed/budget";
import type { UserBudgetItem } from "@/lib/types";
import { Card } from "@/components/Card";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function BudgetPage() {
  const { user } = useAuth();
  const [plannedTotal, setPlannedTotal] = useState<number | null>(null);
  const [items, setItems] = useState<UserBudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [newItem, setNewItem] = useState({ categoryId: BUDGET_CATEGORIES[0].id, name: "", amount: "" });

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const repo = getRepo();
      const [budget, budgetItems] = await Promise.all([repo.getUserBudget(user.id), repo.getBudgetItems(user.id)]);
      if (!active) return;
      setPlannedTotal(budget?.plannedTotal ?? null);
      setItems(budgetItems);
      setLoading(false);
      setEditingBudget(budget === null);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const plannedItemsTotal = useMemo(() => items.reduce((sum, i) => sum + i.amount, 0), [items]);
  const remaining = (plannedTotal ?? 0) - plannedItemsTotal;

  async function saveBudget(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const value = Number(budgetInput.replace(",", "."));
    if (Number.isNaN(value) || value < 0) return;
    await getRepo().saveUserBudget(user.id, value);
    setPlannedTotal(value);
    setEditingBudget(false);
  }

  async function addItem(e: FormEvent) {
    e.preventDefault();
    if (!user || !newItem.name.trim()) return;
    const amount = Number(newItem.amount.replace(",", "."));
    if (Number.isNaN(amount) || amount < 0) return;
    const created = await getRepo().addBudgetItem(user.id, {
      categoryId: newItem.categoryId,
      name: newItem.name.trim(),
      amount,
    });
    setItems((prev) => [...prev, created]);
    setNewItem({ categoryId: newItem.categoryId, name: "", amount: "" });
  }

  async function removeItem(id: string) {
    if (!user) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    await getRepo().removeBudgetItem(user.id, id);
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
      <header className="flex items-center gap-3">
        <Link href="/profile" className="text-sm text-muted">
          ← Perfil
        </Link>
      </header>

      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-foreground">Planejamento do Bebê</h1>
        <p className="mt-1 text-sm text-muted">Um controle simples do orçamento de preparação para a chegada.</p>
      </div>

      {editingBudget ? (
        <Card>
          <form onSubmit={saveBudget} className="flex flex-col gap-3">
            <label className="text-sm text-foreground">Quanto você pretende investir na preparação para a chegada do bebê?</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ex: 5000"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="rounded-2xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-primary"
            />
            <button type="submit" className="rounded-2xl bg-primary py-3 text-sm font-medium text-white">
              Salvar orçamento
            </button>
          </form>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted">Orçamento planejado</p>
              <p className="text-lg font-semibold text-foreground">{formatBRL(plannedTotal ?? 0)}</p>
            </div>
            <button onClick={() => { setBudgetInput(String(plannedTotal ?? "")); setEditingBudget(true); }} className="text-xs text-primary-dark">
              Editar
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-accent-light px-3 py-2.5">
              <p className="text-[11px] text-muted">Itens planejados</p>
              <p className="text-sm font-semibold text-foreground">{formatBRL(plannedItemsTotal)}</p>
            </div>
            <div className={`rounded-2xl px-3 py-2.5 ${remaining < 0 ? "bg-primary-light" : "bg-success-light"}`}>
              <p className="text-[11px] text-muted">Restante</p>
              <p className={`text-sm font-semibold ${remaining < 0 ? "text-primary-dark" : "text-success"}`}>{formatBRL(remaining)}</p>
            </div>
          </div>
        </Card>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Itens planejados</h2>
        <div className="flex flex-col gap-2.5">
          {items.map((item) => {
            const cat = BUDGET_CATEGORIES.find((c) => c.id === item.categoryId);
            return (
              <Card key={item.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {cat?.icon} {item.name}
                    </p>
                    <p className="text-xs text-muted">{cat?.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{formatBRL(item.amount)}</span>
                    <button onClick={() => removeItem(item.id)} className="text-xs text-muted">
                      Remover
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
          {items.length === 0 && <p className="text-sm text-muted">Nenhum item planejado ainda.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Adicionar item</h2>
        <Card>
          <form onSubmit={addItem} className="flex flex-col gap-3">
            <select
              value={newItem.categoryId}
              onChange={(e) => setNewItem((f) => ({ ...f, categoryId: e.target.value }))}
              className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
            >
              {BUDGET_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Nome do item"
              value={newItem.name}
              onChange={(e) => setNewItem((f) => ({ ...f, name: e.target.value }))}
              className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <input
              type="text"
              inputMode="decimal"
              placeholder="Valor estimado"
              value={newItem.amount}
              onChange={(e) => setNewItem((f) => ({ ...f, amount: e.target.value }))}
              className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button type="submit" className="rounded-2xl bg-primary py-3 text-sm font-medium text-white">
              Adicionar
            </button>
          </form>
        </Card>
      </section>
    </div>
  );
}
