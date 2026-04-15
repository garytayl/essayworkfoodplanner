"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveMealDays } from "@/app/actions/week";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDayLabel } from "@/lib/week";

export type MealDayRow = {
  id: string;
  weekStart: string;
  dayIndex: number;
  label: string;
  targetCalories: number | null;
  targetProteinG: number | null;
};

type MealRowProps = {
  weekStart: string;
  mealDays: MealDayRow[];
};

type DayDraft = {
  dayIndex: number;
  label: string;
  targetCalories: string;
  targetProteinG: string;
};

function buildDrafts(rows: MealDayRow[]): DayDraft[] {
  const map = new Map(rows.map((r) => [r.dayIndex, r]));
  return Array.from({ length: 7 }, (_, dayIndex) => {
    const r = map.get(dayIndex);
    return {
      dayIndex,
      label: r?.label ?? "",
      targetCalories:
        r?.targetCalories != null ? String(r.targetCalories) : "",
      targetProteinG: r?.targetProteinG != null ? String(r.targetProteinG) : "",
    };
  });
}

export function MealRow({ weekStart, mealDays }: MealRowProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [days, setDays] = useState<DayDraft[]>(() => buildDrafts(mealDays));

  const save = () => {
    startTransition(async () => {
      await saveMealDays({
        weekStart,
        days: days.map((d) => {
          const kcal = Number.parseInt(d.targetCalories, 10);
          const prot = Number.parseInt(d.targetProteinG, 10);
          return {
            dayIndex: d.dayIndex,
            label: d.label,
            targetCalories: Number.isFinite(kcal) ? kcal : null,
            targetProteinG: Number.isFinite(prot) ? prot : null,
          };
        }),
      });
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly meals</CardTitle>
        <CardDescription>
          Rough daily focus and optional calorie / protein hints for planning
          (not medical advice).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {days.map((d) => (
            <div
              key={d.dayIndex}
              className="space-y-2 rounded-lg border border-border p-3"
            >
              <p className="text-sm font-medium">{getDayLabel(d.dayIndex)}</p>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Focus</Label>
                <Input
                  value={d.label}
                  onChange={(e) =>
                    setDays((prev) =>
                      prev.map((x) =>
                        x.dayIndex === d.dayIndex
                          ? { ...x, label: e.target.value }
                          : x,
                      ),
                    )
                  }
                  placeholder="Meal prep, leftovers…"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">kcal</Label>
                  <Input
                    inputMode="numeric"
                    value={d.targetCalories}
                    onChange={(e) =>
                      setDays((prev) =>
                        prev.map((x) =>
                          x.dayIndex === d.dayIndex
                            ? { ...x, targetCalories: e.target.value }
                            : x,
                        ),
                      )
                    }
                    placeholder="—"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Protein g</Label>
                  <Input
                    inputMode="numeric"
                    value={d.targetProteinG}
                    onChange={(e) =>
                      setDays((prev) =>
                        prev.map((x) =>
                          x.dayIndex === d.dayIndex
                            ? { ...x, targetProteinG: e.target.value }
                            : x,
                        ),
                      )
                    }
                    placeholder="—"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save meal plan"}
        </Button>
      </CardContent>
    </Card>
  );
}
