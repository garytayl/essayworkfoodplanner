"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  essays,
  mealDays,
  restaurantPicks,
  restaurants,
  tasks,
} from "@/db/schema";

import {
  essayUpsertSchema,
  mealDaysSaveSchema,
  restaurantCreateSchema,
  restaurantDeleteSchema,
  restaurantPickSchema,
  tasksReplaceSchema,
} from "./schemas";

function refresh() {
  revalidatePath("/");
}

export async function upsertEssay(raw: unknown) {
  const input = essayUpsertSchema.parse(raw);
  const id = crypto.randomUUID();

  await db
    .insert(essays)
    .values({
      id,
      weekStart: input.weekStart,
      title: input.title,
      dueAt: input.dueAt ?? null,
      status: input.status,
      notesJson: input.notesJson,
    })
    .onConflictDoUpdate({
      target: essays.weekStart,
      set: {
        title: input.title,
        dueAt: input.dueAt ?? null,
        status: input.status,
        notesJson: input.notesJson,
      },
    });

  refresh();
}

export async function replaceTasksForWeek(raw: unknown) {
  const input = tasksReplaceSchema.parse(raw);

  await db.delete(tasks).where(eq(tasks.weekStart, input.weekStart));

  if (input.tasks.length === 0) {
    refresh();
    return;
  }

  await db.insert(tasks).values(
    input.tasks.map((t, i) => ({
      id: t.id ?? crypto.randomUUID(),
      weekStart: input.weekStart,
      essayId: t.essayId ?? null,
      title: t.title,
      sortOrder: t.sortOrder ?? i,
      done: t.done,
    })),
  );

  refresh();
}

export async function saveMealDays(raw: unknown) {
  const input = mealDaysSaveSchema.parse(raw);

  await db.delete(mealDays).where(eq(mealDays.weekStart, input.weekStart));

  await db.insert(mealDays).values(
    input.days.map((day) => ({
      id: crypto.randomUUID(),
      weekStart: input.weekStart,
      dayIndex: day.dayIndex,
      label: day.label,
      targetCalories: day.targetCalories ?? null,
      targetProteinG: day.targetProteinG ?? null,
    })),
  );

  refresh();
}

export async function createRestaurant(raw: unknown) {
  const input = restaurantCreateSchema.parse(raw);
  const id = crypto.randomUUID();
  await db.insert(restaurants).values({
    id,
    name: input.name,
    cuisine: input.cuisine,
    menuJson: input.menuJson ?? null,
  });
  refresh();
  return id;
}

export async function deleteRestaurant(raw: unknown) {
  const input = restaurantDeleteSchema.parse(raw);
  await db.delete(restaurants).where(eq(restaurants.id, input.id));
  refresh();
}

export async function setRestaurantPick(raw: unknown) {
  const input = restaurantPickSchema.parse(raw);

  if (input.restaurantId === null) {
    await db
      .delete(restaurantPicks)
      .where(
        and(
          eq(restaurantPicks.weekStart, input.weekStart),
          eq(restaurantPicks.dayIndex, input.dayIndex),
          eq(restaurantPicks.mealType, input.mealType),
        ),
      );
  } else {
    const id = crypto.randomUUID();
    await db
      .insert(restaurantPicks)
      .values({
        id,
        weekStart: input.weekStart,
        dayIndex: input.dayIndex,
        mealType: input.mealType,
        restaurantId: input.restaurantId,
      })
      .onConflictDoUpdate({
        target: [
          restaurantPicks.weekStart,
          restaurantPicks.dayIndex,
          restaurantPicks.mealType,
        ],
        set: { restaurantId: input.restaurantId },
      });
  }

  refresh();
}
