import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const essays = sqliteTable(
  "essays",
  {
    id: text("id").primaryKey(),
    weekStart: text("week_start").notNull(),
    title: text("title").notNull().default(""),
    dueAt: text("due_at"),
    status: text("status").notNull().default("draft"),
    notesJson: text("notes_json").notNull().default("[]"),
  },
  (t) => [uniqueIndex("essays_week_start_unique").on(t.weekStart)],
);

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  weekStart: text("week_start").notNull(),
  essayId: text("essay_id").references(() => essays.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  done: integer("done", { mode: "boolean" }).notNull().default(false),
});

export const mealDays = sqliteTable(
  "meal_days",
  {
    id: text("id").primaryKey(),
    weekStart: text("week_start").notNull(),
    dayIndex: integer("day_index").notNull(),
    label: text("label").notNull().default(""),
    targetCalories: integer("target_calories"),
    targetProteinG: integer("target_protein_g"),
  },
  (t) => [uniqueIndex("meal_days_week_day_unique").on(t.weekStart, t.dayIndex)],
);

export const restaurants = sqliteTable("restaurants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  cuisine: text("cuisine").notNull().default(""),
  menuJson: text("menu_json"),
});

export const restaurantPicks = sqliteTable(
  "restaurant_picks",
  {
    id: text("id").primaryKey(),
    weekStart: text("week_start").notNull(),
    dayIndex: integer("day_index").notNull(),
    mealType: text("meal_type").notNull(),
    restaurantId: text("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("restaurant_picks_slot_unique").on(
      t.weekStart,
      t.dayIndex,
      t.mealType,
    ),
  ],
);
