import type { TaskWithStatus } from "./tasks";
import { sortByPriority } from "./tasks";

export interface JourneyStage {
  label: string;
  tasks: TaskWithStatus[];
}

const MAX_TASKS_PER_STAGE = 3;

/**
 * Agrupa as tarefas em uma linha do tempo relativa à semana atual: Agora,
 * Próximas semanas, Mais adiante e Antes do nascimento.
 */
export function buildJourney(tasks: TaskWithStatus[], week: number): JourneyStage[] {
  const pending = tasks.filter((t) => t.status === "pendente");

  const now: TaskWithStatus[] = [];
  const soon: TaskWithStatus[] = [];
  const later: TaskWithStatus[] = [];
  const beforeBirth: TaskWithStatus[] = [];

  for (const task of pending) {
    if (task.startWeek <= week && week <= task.endWeek) {
      now.push(task);
    } else if (task.endWeek >= 38) {
      beforeBirth.push(task);
    } else if (task.startWeek > week && task.startWeek <= week + 6) {
      soon.push(task);
    } else if (task.startWeek > week + 6) {
      later.push(task);
    }
  }

  const stages: JourneyStage[] = [
    { label: "Agora", tasks: sortByPriority(now).slice(0, MAX_TASKS_PER_STAGE) },
    { label: "Próximas semanas", tasks: sortByPriority(soon).slice(0, MAX_TASKS_PER_STAGE) },
    { label: "Mais adiante", tasks: sortByPriority(later).slice(0, MAX_TASKS_PER_STAGE) },
    {
      label: "Antes do nascimento",
      tasks: sortByPriority(beforeBirth)
        .sort((a, b) => a.startWeek - b.startWeek)
        .slice(0, MAX_TASKS_PER_STAGE),
    },
  ];

  return stages.filter((stage) => stage.tasks.length > 0);
}
