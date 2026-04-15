/** Remount keys so client form state resets when RSC data changes (week nav or save). */

import type { MealDayRow } from "@/components/meal-row";
import type { TaskItem } from "@/components/task-list";

type EssayLike = {
  id: string;
  title: string;
  notesJson: string;
  status: string;
  dueAt: string | null;
} | null;

export function essayPanelKey(weekStart: string, essay: EssayLike) {
  if (!essay) return `essay:${weekStart}:new`;
  return `essay:${weekStart}:${essay.id}:${essay.title}:${essay.notesJson}:${essay.status}:${essay.dueAt ?? ""}`;
}

export function taskListKey(weekStart: string, tasks: TaskItem[]) {
  return `tasks:${weekStart}:${tasks.map((t) => `${t.id}|${t.title}|${t.done}|${t.sortOrder}|${t.essayId ?? ""}`).join(";")}`;
}

export function mealRowKey(weekStart: string, mealDays: MealDayRow[]) {
  return `meals:${weekStart}:${mealDays.map((m) => `${m.dayIndex}|${m.label}|${m.targetCalories}|${m.targetProteinG}`).join(";")}`;
}
