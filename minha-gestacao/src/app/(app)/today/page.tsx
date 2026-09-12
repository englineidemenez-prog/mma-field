"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePregnancyData } from "@/lib/hooks/usePregnancyData";
import { getRepo } from "@/lib/data/repo";
import { activeForWeek, mergeTaskStatus, sortByPriority, upcomingAfterWeek, type TaskWithStatus } from "@/lib/domain/tasks";
import { CHECKLIST_CATEGORY_LABELS } from "@/lib/types";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { TaskRow } from "@/components/TaskRow";

export default function TodayPage() {
  const { user } = useAuth();
  const { progress, loading: profileLoading } = usePregnancyData();
  const [tasks, setTasks] = useState<TaskWithStatus[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const repo = getRepo();
      const [templates, userTasks] = await Promise.all([repo.getChecklistTasks(), repo.getUserTasks(user.id)]);
      if (!active) return;
      setTasks(mergeTaskStatus(templates, userTasks));
      setLoadingTasks(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  async function toggleTask(taskId: string, currentStatus: TaskWithStatus["status"]) {
    if (!user) return;
    const nextStatus = currentStatus === "concluida" ? "pendente" : "concluida";
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)));
    await getRepo().setTaskStatus(user.id, taskId, nextStatus);
  }

  if (profileLoading || loadingTasks) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <span className="text-3xl">🤰</span>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="flex flex-col gap-4 px-6 py-8">
        <Card>
          <p className="text-base text-foreground">
            Para começar a ver sua jornada personalizada, informe a data prevista do parto (ou a data da última
            menstruação) no seu perfil.
          </p>
          <Link
            href="/profile"
            className="mt-4 inline-block rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-white"
          >
            Completar meu perfil
          </Link>
        </Card>
      </div>
    );
  }

  const week = progress.currentWeek;
  const active = activeForWeek(tasks, week);
  const pendingActive = sortByPriority(active.filter((t) => t.status === "pendente"));
  const priorityTask = pendingActive[0];
  const weekTasks = pendingActive.slice(0, 5);
  const nextTask = upcomingAfterWeek(tasks, week)[0];

  return (
    <div className="flex flex-col gap-5 px-6 py-8">
      <section className="text-center">
        <div className="mb-3 text-5xl">🤰</div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-foreground">
          Você está com {week} semana{week === 1 ? "" : "s"}
        </h1>
        <p className="mt-1 text-sm text-muted">Seu bebê está cada vez mais próximo.</p>

        <div className="mt-5">
          <ProgressBar percent={progress.percentComplete} />
          <p className="mt-2 text-xs text-muted">{progress.percentComplete}% da jornada concluída</p>
        </div>
      </section>

      {priorityTask && (
        <Card className="bg-primary-light">
          <p className="text-xs font-medium uppercase tracking-wide text-primary-dark">Sua prioridade agora</p>
          <div className="mt-2 flex items-start gap-3">
            <span className="text-2xl">{CHECKLIST_CATEGORY_LABELS[priorityTask.category].icon}</span>
            <div>
              <h2 className="text-base font-semibold text-foreground">{priorityTask.title}</h2>
              <p className="mt-1 text-sm text-foreground/80">{priorityTask.description}</p>
            </div>
          </div>
          <Link
            href="/checklist"
            className="mt-4 inline-block rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-white"
          >
            VER CHECKLIST
          </Link>
        </Card>
      )}

      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Para esta semana</h3>
        {weekTasks.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">Nenhuma tarefa pendente para esta semana. Bom trabalho! 🎉</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {weekTasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id, task.status)} />
            ))}
          </div>
        )}
      </section>

      {nextTask && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Próxima etapa importante</h3>
          <Card className="border border-border">
            <p className="text-xs text-muted">A partir da semana {nextTask.startWeek}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xl">{CHECKLIST_CATEGORY_LABELS[nextTask.category].icon}</span>
              <p className="text-sm font-medium text-foreground">{nextTask.title}</p>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
