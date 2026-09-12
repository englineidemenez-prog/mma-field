"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePregnancyData } from "@/lib/hooks/usePregnancyData";
import { getRepo } from "@/lib/data/repo";
import type { PregnancyProfile } from "@/lib/types";
import { COUNTRY_OPTIONS } from "@/lib/countries";

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, refresh, loading } = usePregnancyData();

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
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
      <header className="text-center">
        <div className="mb-2 text-4xl">👤</div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-foreground">Perfil</h1>
        {user?.email && <p className="mt-1 text-sm text-muted">{user.email}</p>}
      </header>

      {user && (
        <ProfileForm
          key={profile?.onboardingCompletedAt ?? "new"}
          userId={user.id}
          profile={profile}
          onSaved={refresh}
        />
      )}

      <Link
        href="/profile/budget"
        className="flex items-center justify-between rounded-3xl bg-surface p-5 shadow-[0_2px_16px_rgba(58,46,53,0.06)]"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">💰 Planejamento do Bebê</span>
        <span className="text-muted">›</span>
      </Link>

      <button onClick={handleSignOut} className="rounded-2xl border border-border py-3 text-sm font-medium text-muted">
        Sair da conta
      </button>
    </div>
  );
}

function ProfileForm({
  userId,
  profile,
  onSaved,
}: {
  userId: string;
  profile: PregnancyProfile | null;
  onSaved: () => Promise<void>;
}) {
  const [dueDate, setDueDate] = useState(profile?.dueDate ?? "");
  const [country, setCountry] = useState(profile?.country ?? "BR");
  const [isFirstPregnancy, setIsFirstPregnancy] = useState<boolean | null>(profile?.isFirstPregnancy ?? null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notificationsEnabled ?? true);
  const [saved, setSaved] = useState(false);

  async function save() {
    await getRepo().saveProfile(userId, {
      dueDate: dueDate || null,
      country,
      isFirstPregnancy,
      notificationsEnabled,
    });
    await onSaved();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-surface p-5 shadow-[0_2px_16px_rgba(58,46,53,0.06)]">
      <label className="flex flex-col gap-1.5 text-sm text-foreground">
        Data prevista do parto
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-2xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-foreground">
        País
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-2xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
        >
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-1.5 text-sm text-foreground">
        Primeira gravidez
        <div className="flex gap-2">
          {[
            { label: "Sim", value: true },
            { label: "Não", value: false },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => setIsFirstPregnancy(opt.value)}
              className={`flex-1 rounded-2xl border px-4 py-2.5 text-sm ${
                isFirstPregnancy === opt.value
                  ? "border-primary bg-primary-light text-primary-dark"
                  : "border-border bg-background text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center justify-between text-sm text-foreground">
        <span>
          Notificações
          <span className="block text-xs text-muted">Avisos sobre novas semanas e etapas</span>
        </span>
        <input
          type="checkbox"
          checked={notificationsEnabled}
          onChange={(e) => setNotificationsEnabled(e.target.checked)}
          className="h-5 w-5 rounded accent-primary"
        />
      </label>

      <button onClick={save} className="rounded-2xl bg-primary py-3 text-sm font-medium text-white">
        {saved ? "Salvo ✓" : "Salvar alterações"}
      </button>
    </div>
  );
}
