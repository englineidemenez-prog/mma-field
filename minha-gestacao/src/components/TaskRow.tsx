import { CHECKLIST_CATEGORY_LABELS } from "@/lib/types";
import type { TaskWithStatus } from "@/lib/domain/tasks";

export function TaskRow({ task, onToggle }: { task: TaskWithStatus; onToggle: () => void }) {
  const done = task.status === "concluida";
  const category = CHECKLIST_CATEGORY_LABELS[task.category];

  return (
    <button
      onClick={onToggle}
      className="flex w-full items-start gap-3 rounded-2xl bg-surface px-4 py-3.5 text-left shadow-[0_2px_16px_rgba(58,46,53,0.06)]"
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[11px] ${
          done ? "border-success bg-success text-white" : "border-border text-transparent"
        }`}
      >
        ✓
      </span>
      <div className="flex-1">
        <p className={`text-sm font-medium ${done ? "text-muted line-through" : "text-foreground"}`}>{task.title}</p>
        <p className="mt-0.5 text-xs text-muted">{task.description}</p>
        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-accent-light px-2 py-0.5 text-[11px] text-accent">
          {category.icon} {category.label}
        </span>
      </div>
    </button>
  );
}
