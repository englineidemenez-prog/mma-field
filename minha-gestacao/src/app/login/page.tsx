"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, isDemoMode } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível continuar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-10">
      <div className="mb-10 text-center">
        <div className="mb-4 text-5xl">🤰</div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-foreground">Minha Gestação</h1>
        <p className="mt-2 text-sm text-muted">Sua jornada, organizada, semana a semana.</p>
      </div>

      {isDemoMode && (
        <div className="mb-6 rounded-2xl bg-accent-light px-4 py-3 text-xs text-foreground">
          Modo demonstração: seus dados ficam salvos apenas neste navegador. Configure o Supabase para usar uma conta
          real.
        </div>
      )}

      <div className="mb-6 flex rounded-2xl bg-primary-light p-1">
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
            mode === "signup" ? "bg-surface text-primary-dark shadow-sm" : "text-muted"
          }`}
        >
          Criar conta
        </button>
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
            mode === "signin" ? "bg-surface text-primary-dark shadow-sm" : "text-muted"
          }`}
        >
          Entrar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-foreground">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-primary"
            placeholder="voce@exemplo.com"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-foreground">
          Senha
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-primary"
            placeholder="Mínimo 6 caracteres"
          />
        </label>

        {error && <p className="text-sm text-primary-dark">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-2xl bg-primary py-3.5 text-base font-medium text-white transition-opacity disabled:opacity-60"
        >
          {submitting ? "Aguarde…" : mode === "signup" ? "Criar minha conta" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
