"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { getRepo } from "@/lib/data/repo";
import { COUNTRY_OPTIONS, countryLabel } from "@/lib/countries";

interface OnboardingForm {
  dueDate: string;
  lastPeriodDate: string;
  unknownDate: boolean;
  isFirstPregnancy: boolean | null;
  countryCode: string;
}

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<OnboardingForm>({
    dueDate: "",
    lastPeriodDate: "",
    unknownDate: false,
    isFirstPregnancy: null,
    countryCode: "BR",
  });

  function next() {
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function finish() {
    if (!user) return;
    setSaving(true);
    try {
      await getRepo().saveProfile(user.id, {
        dueDate: form.dueDate || null,
        lastPeriodDate: form.unknownDate ? form.lastPeriodDate || null : null,
        isFirstPregnancy: form.isFirstPregnancy,
        country: form.countryCode,
        onboardingCompletedAt: new Date().toISOString(),
      });
      router.replace("/today");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col px-6 py-8">
      <div className="mb-8 flex gap-1.5">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-primary-light"}`}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col">
        {step === 1 && (
          <StepWelcome onNext={next} />
        )}
        {step === 2 && (
          <StepDueDate
            form={form}
            setForm={setForm}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 3 && (
          <StepFirstPregnancy form={form} setForm={setForm} onNext={next} onBack={back} />
        )}
        {step === 4 && (
          <StepCountry form={form} setForm={setForm} onNext={next} onBack={back} />
        )}
        {step === 5 && (
          <StepSummary form={form} onBack={back} onFinish={finish} saving={saving} />
        )}
      </div>
    </div>
  );
}

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="mb-6 text-6xl">🤰</div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl leading-snug text-foreground">
        Vamos acompanhar sua jornada?
      </h1>
      <p className="mt-3 text-sm text-muted">
        Em poucos passos, vamos organizar tudo o que você precisa fazer até a chegada do bebê.
      </p>
      <button
        onClick={onNext}
        className="mt-10 w-full rounded-2xl bg-primary py-3.5 text-base font-medium text-white"
      >
        COMEÇAR
      </button>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextDisabled,
  nextLabel = "Continuar",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug text-foreground">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
      <div className="mt-8 flex-1">{children}</div>
      <div className="mt-8 flex gap-3">
        <button onClick={onBack} className="rounded-2xl px-5 py-3.5 text-sm font-medium text-muted">
          Voltar
        </button>
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="flex-1 rounded-2xl bg-primary py-3.5 text-base font-medium text-white disabled:opacity-40"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

function StepDueDate({
  form,
  setForm,
  onNext,
  onBack,
}: {
  form: OnboardingForm;
  setForm: (updater: (f: OnboardingForm) => OnboardingForm) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const canContinue = form.unknownDate ? true : form.dueDate.length > 0;
  return (
    <StepShell
      title="Quando seu bebê deve nascer?"
      subtitle="Use a data prevista do parto informada no seu pré-natal."
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!canContinue}
    >
      <div className="flex flex-col gap-4">
        <input
          type="date"
          value={form.dueDate}
          disabled={form.unknownDate}
          onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          className="rounded-2xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-primary disabled:opacity-40"
        />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={form.unknownDate}
            onChange={(e) => setForm((f) => ({ ...f, unknownDate: e.target.checked, dueDate: "" }))}
            className="h-4 w-4 rounded accent-primary"
          />
          Não sei a data prevista
        </label>
        {form.unknownDate && (
          <label className="flex flex-col gap-1.5 text-sm text-foreground">
            Data da última menstruação (opcional)
            <input
              type="date"
              value={form.lastPeriodDate}
              onChange={(e) => setForm((f) => ({ ...f, lastPeriodDate: e.target.value }))}
              className="rounded-2xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-primary"
            />
          </label>
        )}
      </div>
    </StepShell>
  );
}

function StepFirstPregnancy({
  form,
  setForm,
  onNext,
  onBack,
}: {
  form: OnboardingForm;
  setForm: (updater: (f: OnboardingForm) => OnboardingForm) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <StepShell
      title="Esta é sua primeira gravidez?"
      onNext={onNext}
      onBack={onBack}
      nextDisabled={form.isFirstPregnancy === null}
    >
      <div className="flex flex-col gap-3">
        {[
          { label: "Sim", value: true },
          { label: "Não", value: false },
        ].map((opt) => (
          <button
            key={opt.label}
            onClick={() => setForm((f) => ({ ...f, isFirstPregnancy: opt.value }))}
            className={`rounded-2xl border px-4 py-3.5 text-left text-base transition-colors ${
              form.isFirstPregnancy === opt.value
                ? "border-primary bg-primary-light text-primary-dark"
                : "border-border bg-surface text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </StepShell>
  );
}

function StepCountry({
  form,
  setForm,
  onNext,
  onBack,
}: {
  form: OnboardingForm;
  setForm: (updater: (f: OnboardingForm) => OnboardingForm) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <StepShell
      title="Em qual país você mora?"
      subtitle="Usaremos isso futuramente para personalizar recomendações de produtos."
      onNext={onNext}
      onBack={onBack}
    >
      <div className="flex flex-col gap-3">
        {COUNTRY_OPTIONS.map((c) => (
          <button
            key={c.code}
            onClick={() => setForm((f) => ({ ...f, countryCode: c.code }))}
            className={`rounded-2xl border px-4 py-3.5 text-left text-base transition-colors ${
              form.countryCode === c.code ? "border-primary bg-primary-light text-primary-dark" : "border-border bg-surface text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </StepShell>
  );
}

function StepSummary({
  form,
  onBack,
  onFinish,
  saving,
}: {
  form: OnboardingForm;
  onBack: () => void;
  onFinish: () => void;
  saving: boolean;
}) {
  const dateLabel = form.unknownDate
    ? form.lastPeriodDate
      ? `Última menstruação: ${form.lastPeriodDate}`
      : "Data ainda não informada"
    : form.dueDate
      ? `Parto previsto: ${form.dueDate}`
      : "Data ainda não informada";

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="font-[family-name:var(--font-display)] text-2xl leading-snug text-foreground">
        Vamos personalizar sua jornada.
      </h2>
      <div className="mt-8 flex flex-1 flex-col gap-3">
        <SummaryRow label={dateLabel} />
        <SummaryRow label={form.isFirstPregnancy ? "Primeira gravidez" : "Já teve gravidez anterior"} />
        <SummaryRow label={`País: ${countryLabel(form.countryCode)}`} />
      </div>
      <div className="mt-8 flex gap-3">
        <button onClick={onBack} className="rounded-2xl px-5 py-3.5 text-sm font-medium text-muted">
          Voltar
        </button>
        <button
          onClick={onFinish}
          disabled={saving}
          className="flex-1 rounded-2xl bg-primary py-3.5 text-base font-medium text-white disabled:opacity-60"
        >
          {saving ? "Criando…" : "CRIAR MINHA JORNADA"}
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label }: { label: string }) {
  return <div className="rounded-2xl bg-accent-light px-4 py-3 text-sm text-foreground">{label}</div>;
}
