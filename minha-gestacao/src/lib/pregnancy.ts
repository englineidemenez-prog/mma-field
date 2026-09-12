// Cálculo da fase da gestação. Puro e configurável: qualquer ajuste de regra
// (duração média da gestação, limites de trimestre) muda só aqui.
import type { Trimester } from "./types";

/** Duração média de uma gestação a termo, em dias (40 semanas). */
export const GESTATION_DAYS = 280;

/** Semana em que cada trimestre termina (inclusive). */
const TRIMESTER_BOUNDARIES: Record<Trimester, number> = {
  1: 13,
  2: 27,
  3: 42,
};

export interface PregnancyProgress {
  currentWeek: number; // 1 a 42, arredondado para baixo
  currentDay: number; // dia dentro da semana, 0 a 6
  daysPregnant: number;
  daysRemaining: number;
  percentComplete: number; // 0 a 100
  trimester: Trimester;
  dueDate: string; // ISO date
  isOverdue: boolean;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISODate(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

function diffInDays(a: Date, b: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / MS_PER_DAY);
}

export function getTrimester(week: number): Trimester {
  if (week <= TRIMESTER_BOUNDARIES[1]) return 1;
  if (week <= TRIMESTER_BOUNDARIES[2]) return 2;
  return 3;
}

/**
 * Calcula o progresso da gestação a partir da data prevista do parto (DPP).
 * `today` é injetável para permitir testes determinísticos.
 */
export function calculateFromDueDate(dueDateISO: string, today: Date = new Date()): PregnancyProgress {
  const dueDate = startOfDay(new Date(`${dueDateISO}T00:00:00`));
  const conceptionStart = new Date(dueDate);
  conceptionStart.setDate(conceptionStart.getDate() - GESTATION_DAYS);

  const daysPregnantRaw = diffInDays(today, conceptionStart);
  const daysPregnant = Math.max(0, daysPregnantRaw);
  const daysRemainingRaw = diffInDays(dueDate, today);

  const currentWeek = Math.min(42, Math.max(1, Math.floor(daysPregnant / 7) + 1));
  const currentDay = daysPregnant % 7;
  const percentComplete = Math.min(100, Math.max(0, Math.round((daysPregnant / GESTATION_DAYS) * 100)));

  return {
    currentWeek,
    currentDay,
    daysPregnant,
    daysRemaining: Math.max(0, daysRemainingRaw),
    percentComplete,
    trimester: getTrimester(currentWeek),
    dueDate: toISODate(dueDate),
    isOverdue: daysRemainingRaw < 0,
  };
}

/**
 * Calcula o progresso a partir da data da última menstruação (DUM), quando a
 * usuária não sabe/não tem a DPP calculada pelo médico.
 */
export function calculateFromLastPeriod(lastPeriodISO: string, today: Date = new Date()): PregnancyProgress {
  const lastPeriod = startOfDay(new Date(`${lastPeriodISO}T00:00:00`));
  const dueDate = new Date(lastPeriod);
  dueDate.setDate(dueDate.getDate() + GESTATION_DAYS);
  return calculateFromDueDate(toISODate(dueDate), today);
}

export function formatWeeksLabel(progress: PregnancyProgress): string {
  return `${progress.currentWeek} semana${progress.currentWeek === 1 ? "" : "s"}`;
}
