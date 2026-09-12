"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePregnancyData } from "@/lib/hooks/usePregnancyData";
import { getRepo } from "@/lib/data/repo";
import { mergeTaskStatus, type TaskWithStatus } from "@/lib/domain/tasks";
import { CHECKLIST_CATEGORY_LABELS, type ChecklistCategory } from "@/lib/types";
import { Card } from "@/components/Card";
import { TaskRow } from "@/components/TaskRow";

const CATEGORY_ORDER = Object.keys(CHECKLIST_CATEGORY_LABELS) as ChecklistCategory[];

export default function ChecklistPage() {
  const { user } = useAuth();
  const { progress, loading: profileLoading } = usePregnancyData();
  const [tasks, setTasks] = useState<TaskWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpcoming, setShowUpcoming] = useState(false);

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

  async function toggleTask(taskId: string, currentStatus: TaskWithStatus["status"]) {
    if (!user) return;
    const nextStatus = currentStatus === "concluida" ? "pendente" : "concluida";
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)));
    await getRepo().setTaskStatus(user.id, taskId, nextStatus);
  }

  const week = progress?.currentWeek ?? 1;

  const { byCategory, upcoming } = useMemo(() => {
    const now = tasks.filter((t) => t.startWeek <= week);
    const future = tasks.filter((t) => t.startWeek > week).sort((a, b) => a.startWeek - b.startWeek);
    const grouped = new Map<ChecklistCategory, TaskWithStatus[]>();
    for (const cat of CATEGORY_ORDER) grouped.set(cat, []);
    for (const t of now) grouped.get(t.category)?.push(t);
    return { byCategory: grouped, upcoming: future };
  }, [tasks, week]);

  if (loading || profileLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <span className="text-3xl">🤰</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-6 py-8">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-foreground">Checklist</h1>
        <p className="mt-1 text-sm text-muted">Tarefas organizadas por categoria, para a semana {week}.</p>
      </header>

      {CATEGORY_ORDER.map((cat) => {
        const catTasks = byCategory.get(cat) ?? [];
        if (catTasks.length === 0) return null;
        const done = catTasks.filter((t) => t.status === "concluida").length;
        const info = CHECKLIST_CATEGORY_LABELS[cat];
        return (
          <section key={cat}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span>{info.icon}</span> {info.label}
              </h2>
              <span className="text-xs text-muted">
                {done}/{catTasks.length}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {catTasks.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id, task.status)} />
              ))}
            </div>
          </section>
        );
      })}

      {upcoming.length > 0 && (
        <section>
          <button
            onClick={() => setShowUpcoming((v) => !v)}
            className="mb-3 flex w-full items-center justify-between text-sm font-semibold text-muted"
          >
            <span>Em breve ({upcoming.length})</span>
            <span>{showUpcoming ? "▲" : "▼"}</span>
          </button>
          {showUpcoming && (
            <div className="flex flex-col gap-2.5">
              {upcoming.map((task) => (
                <Card key={task.id} className="opacity-70">
                  <p className="text-xs text-muted">A partir da semana {task.startWeek}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span>{CHECKLIST_CATEGORY_LABELS[task.category].icon}</span>
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
