import { EssayPanel } from "@/components/essay-panel";
import { MealRow } from "@/components/meal-row";
import { RestaurantPicker } from "@/components/restaurant-picker";
import { TaskList } from "@/components/task-list";
import { WeekNav } from "@/components/week-nav";
import { getDashboardData } from "@/db/queries";
import {
  essayPanelKey,
  mealRowKey,
  taskListKey,
} from "@/lib/panel-keys";
import { parseWeekParam } from "@/lib/week";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ week?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const sp = await searchParams;
  const weekStart = parseWeekParam(sp.week);
  const data = await getDashboardData(weekStart);

  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Kate&apos;s Wheelhouse
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Essays, priorities, meals, and dining in one week view—so school fuel and
          food stay in sync.
        </p>
      </header>

      <WeekNav weekStart={weekStart} />

      <div className="grid gap-8">
        <EssayPanel
          key={essayPanelKey(weekStart, data.essay)}
          weekStart={weekStart}
          essay={data.essay}
        />
        <TaskList
          key={taskListKey(weekStart, data.tasks)}
          weekStart={weekStart}
          tasks={data.tasks}
          essayId={data.essay?.id ?? null}
        />
        <MealRow
          key={mealRowKey(weekStart, data.mealDays)}
          weekStart={weekStart}
          mealDays={data.mealDays}
        />
        <RestaurantPicker
          weekStart={weekStart}
          restaurants={data.restaurants}
          picks={data.picks}
        />
      </div>
    </div>
  );
}
