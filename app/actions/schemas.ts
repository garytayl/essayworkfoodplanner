import { z } from "zod";

const ymd = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .optional()
  .nullable();

export const essayUpsertSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().max(500).default(""),
  dueAt: ymd,
  status: z.enum(["draft", "outlining", "drafting", "editing", "done"]).default(
    "draft",
  ),
  notesJson: z
    .string()
    .refine((s) => {
      try {
        const v = JSON.parse(s) as unknown;
        return Array.isArray(v) && v.every((x) => typeof x === "string");
      } catch {
        return false;
      }
    }, "notesJson must be a JSON array of strings"),
});

export const tasksReplaceSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tasks: z.array(
    z.object({
      id: z.string().uuid().optional(),
      title: z.string().min(1).max(500),
      done: z.boolean(),
      essayId: z.string().uuid().nullable().optional(),
      sortOrder: z.number().int().min(0),
    }),
  ),
});

export const mealDaysSaveSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z
    .array(
      z.object({
        dayIndex: z.number().int().min(0).max(6),
        label: z.string().max(500).default(""),
        targetCalories: z.number().int().min(0).nullable().optional(),
        targetProteinG: z.number().int().min(0).nullable().optional(),
      }),
    )
    .length(7),
});

export const restaurantCreateSchema = z.object({
  name: z.string().min(1).max(200),
  cuisine: z.string().max(200).default(""),
  menuJson: z.string().max(50_000).nullable().optional(),
});

export const restaurantDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const restaurantPickSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dayIndex: z.number().int().min(0).max(6),
  mealType: z.enum(["dinner", "lunch", "breakfast"]),
  restaurantId: z.string().uuid().nullable(),
});
