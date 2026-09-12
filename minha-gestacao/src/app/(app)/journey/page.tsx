"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePregnancyData } from "@/lib/hooks/usePregnancyData";
import { getRepo } from "@/lib/data/repo";
import { mergeTaskStatus, type TaskWithStatus } from "@/lib/domain/tasks";
import { buildJourney } from "@/lib/domain/journey";
import { CHECKLIST_CATEGORY_LABELS } from "@/lib/types";

export default function JourneyPage() {
  const { user } = useAuth();
  const { progress, loading: profileLoading } = usePregnancyData();
  const [tasks, setTasks] = useState<TaskWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const repo = getRepo();
      const [templates, userTasks] = await Promise.all([repo.getChecklistTasks(), repo.getUserTasks(user.id)]);
      if (!active) return;
      setTasks(mergeTaskStatus(templates, userTasks));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  if (loading || profileLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <span className="text-3xl">🤰</span>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-muted">Complete seu perfil para ver sua jornada personalizada.</p>
      </div>
    );
  }

  const stages = buildJourney(tasks, progress.currentWeek);

  return (
    <div className="flex flex-col gap-6 px-6 py-8">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-foreground">Sua jornada</h1>
        <p className="mt-1 text-sm text-muted">O que vem pela frente, na ordem certa.</p>
      </header>

      <div className="flex flex-col">
        {stages.map((stage, index) => (
          <div key={stage.label} className="relative flex gap-4 pb-8 last:pb-0">
            <div className="flex flex-col items-center">
              <span className="flex h-3 w-3 shrink-0 rounded-full bg-primary" />
              {index < stages.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
            </div>
            <div className="flex-1 pt-[-2px]">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{stage.label}</p>
              <div className="mt-2 flex flex-col gap-2">
                {stage.tasks.map((task) => (
                  <div key={task.id} className="rounded-2xl bg-surface px-4 py-3 shadow-[0_2px_16px_rgba(58,46,53,0.06)]">
                    <div className="flex items-center gap-2">
                      <span>{CHECKLIST_CATEGORY_LABELS[task.category].icon}</span>
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {stages.length === 0 && <p className="text-sm text-muted">Você concluiu todas as tarefas planejadas até agora. 🎉</p>}
      </div>
    </div>
  );
}
