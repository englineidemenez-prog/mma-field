import type { ChecklistTaskTemplate, TaskPriority, UserTask, UserTaskStatus } from "../types";

export interface TaskWithStatus extends ChecklistTaskTemplate {
  status: UserTaskStatus;
}

export function mergeTaskStatus(
  tasks: ChecklistTaskTemplate[],
  userTasks: Record<string, UserTask>,
): TaskWithStatus[] {
  return tasks.map((t) => ({ ...t, status: userTasks[t.id]?.status ?? "pendente" }));
}

/** Tarefas relevantes para a semana gestacional atual. */
export function activeForWeek<T extends ChecklistTaskTemplate>(tasks: T[], week: number): T[] {
  return tasks.filter((t) => week >= t.startWeek && week <= t.endWeek);
}

/** Tarefas futuras ("Em breve"), mais próximas primeiro. */
export function upcomingAfterWeek<T extends ChecklistTaskTemplate>(tasks: T[], week: number): T[] {
  return tasks.filter((t) => t.startWeek > week).sort((a, b) => a.startWeek - b.startWeek);
}

const PRIORITY_ORDER: Record<TaskPriority, number> = { alta: 0, media: 1, baixa: 2 };

export function sortByPriority<T extends ChecklistTaskTemplate>(tasks: T[]): T[] {
  return [...tasks].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.startWeek - b.startWeek,
  );
}
