import { and, asc, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

import { getDb } from "./index";
import {
  essays,
  mealDays,
  restaurantPicks,
  restaurants,
  tasks,
} from "./schema";

export type DashboardData = {
  essay: InferSelectModel<typeof essays> | null;
  tasks: InferSelectModel<typeof tasks>[];
  mealDays: InferSelectModel<typeof mealDays>[];
  restaurants: InferSelectModel<typeof restaurants>[];
  picks: InferSelectModel<typeof restaurantPicks>[];
  dbUnavailable: boolean;
  dbErrorMessage?: string;
};

function emptyDashboard(
  reason?: string,
): DashboardData {
  return {
    essay: null,
    tasks: [],
    mealDays: [],
    restaurants: [],
    picks: [],
    dbUnavailable: true,
    dbErrorMessage: reason,
  };
}

export async function getDashboardData(weekStart: string): Promise<DashboardData> {
  const database = getDb();
  if (!database) {
    return emptyDashboard(
      "No DATABASE_URL on this host. Add a Turso (libsql) URL in project settings.",
    );
  }

  try {
    const [essay] = await database
      .select()
      .from(essays)
      .where(eq(essays.weekStart, weekStart))
      .limit(1);

    const taskList = await database
      .select()
      .from(tasks)
      .where(eq(tasks.weekStart, weekStart))
      .orderBy(asc(tasks.sortOrder), asc(tasks.title));

    const meals = await database
      .select()
      .from(mealDays)
      .where(eq(mealDays.weekStart, weekStart));

    const restaurantList = await database
      .select()
      .from(restaurants)
      .orderBy(asc(restaurants.name));

    const picks = await database
      .select()
      .from(restaurantPicks)
      .where(eq(restaurantPicks.weekStart, weekStart));

    return {
      essay: essay ?? null,
      tasks: taskList,
      mealDays: meals,
      restaurants: restaurantList,
      picks,
      dbUnavailable: false,
    };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Unknown database error (check DATABASE_URL and migrations).";
    console.error("[getDashboardData]", e);
    return emptyDashboard(message);
  }
}

export async function getRestaurantById(id: string) {
  const database = getDb();
  if (!database) return null;
  const [row] = await database
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, id))
    .limit(1);
  return row ?? null;
}

export async function getPickForSlot(
  weekStart: string,
  dayIndex: number,
  mealType: string,
) {
  const database = getDb();
  if (!database) return null;
  const [row] = await database
    .select()
    .from(restaurantPicks)
    .where(
      and(
        eq(restaurantPicks.weekStart, weekStart),
        eq(restaurantPicks.dayIndex, dayIndex),
        eq(restaurantPicks.mealType, mealType),
      ),
    )
    .limit(1);
  return row ?? null;
}
