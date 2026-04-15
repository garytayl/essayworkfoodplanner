/** ISO week: Monday = day 0 … Sunday = day 6 (local calendar). */

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function getDayLabel(dayIndex: number): string {
  return DAY_LABELS[dayIndex] ?? "?";
}

export function getDayLabels(): readonly string[] {
  return DAY_LABELS;
}

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfIsoWeekMonday(d: Date): Date {
  const day = d.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(d);
  monday.setDate(d.getDate() - daysSinceMonday);
  monday.setHours(12, 0, 0, 0);
  return monday;
}

export function toWeekStartString(d: Date): string {
  return formatYMD(startOfIsoWeekMonday(d));
}

export function getCurrentWeekStart(): string {
  return toWeekStartString(new Date());
}

export function parseWeekParam(week: string | undefined): string {
  if (week && /^\d{4}-\d{2}-\d{2}$/.test(week)) {
    const d = new Date(`${week}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return toWeekStartString(d);
    }
  }
  return getCurrentWeekStart();
}

export function shiftWeek(weekStart: string, deltaWeeks: number): string {
  const d = new Date(`${weekStart}T12:00:00`);
  d.setDate(d.getDate() + deltaWeeks * 7);
  return toWeekStartString(d);
}

export function formatWeekRangeLabel(weekStart: string): string {
  const start = new Date(`${weekStart}T12:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const y = start.getFullYear();
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}, ${y}`;
}
