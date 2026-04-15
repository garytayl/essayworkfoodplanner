import { and, asc, eq } from "drizzle-orm";

import { db } from "./index";
import {
  essays,
  mealDays,
  restaurantPicks,
  restaurants,
  tasks,
} from "./schema";

export async function getDashboardData(weekStart: string) {
  const [essay] = await db
    .select()
    .from(essays)
    .where(eq(essays.weekStart, weekStart))
    .limit(1);

  const taskList = await db
    .select()
    .from(tasks)
    .where(eq(tasks.weekStart, weekStart))
    .orderBy(asc(tasks.sortOrder), asc(tasks.title));

  const meals = await db
    .select()
    .from(mealDays)
    .where(eq(mealDays.weekStart, weekStart));

  const restaurantList = await db
    .select()
    .from(restaurants)
    .orderBy(asc(restaurants.name));

  const picks = await db
    .select()
    .from(restaurantPicks)
    .where(eq(restaurantPicks.weekStart, weekStart));

  return {
    essay: essay ?? null,
    tasks: taskList,
    mealDays: meals,
    restaurants: restaurantList,
    picks,
  };
}

export async function getRestaurantById(id: string) {
  const [row] = await db
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
  const [row] = await db
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
