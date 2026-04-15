"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  createRestaurant,
  deleteRestaurant,
  setRestaurantPick,
} from "@/app/actions/week";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getDayLabel } from "@/lib/week";

export type RestaurantRow = {
  id: string;
  name: string;
  cuisine: string;
  menuJson: string | null;
};

export type PickRow = {
  id: string;
  weekStart: string;
  dayIndex: number;
  mealType: string;
  restaurantId: string;
};

type RestaurantPickerProps = {
  weekStart: string;
  restaurants: RestaurantRow[];
  picks: PickRow[];
};

const MEALS = [
  { value: "dinner", label: "Dinner" },
  { value: "lunch", label: "Lunch" },
  { value: "breakfast", label: "Breakfast" },
] as const;

export function RestaurantPicker({
  weekStart,
  restaurants,
  picks,
}: RestaurantPickerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [menuNotes, setMenuNotes] = useState("");

  const [pickDay, setPickDay] = useState(4);
  const [pickMeal, setPickMeal] = useState<string>("dinner");

  const selectedRestaurantId = useMemo(() => {
    return (
      picks.find((p) => p.dayIndex === pickDay && p.mealType === pickMeal)
        ?.restaurantId ?? ""
    );
  }, [picks, pickDay, pickMeal]);

  const addRestaurant = () => {
    startTransition(async () => {
      const menuJson =
        menuNotes.trim() === "" ? null : JSON.stringify({ notes: menuNotes });
      await createRestaurant({
        name,
        cuisine,
        menuJson,
      });
      setName("");
      setCuisine("");
      setMenuNotes("");
      router.refresh();
    });
  };

  const removeRestaurant = (id: string) => {
    startTransition(async () => {
      await deleteRestaurant({ id });
      router.refresh();
    });
  };

  const applyPick = (restaurantId: string | null) => {
    startTransition(async () => {
      await setRestaurantPick({
        weekStart,
        dayIndex: pickDay,
        mealType: pickMeal as "dinner" | "lunch" | "breakfast",
        restaurantId,
      });
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restaurants</CardTitle>
        <CardDescription>
          Save places you like, then attach one to a meal slot this week.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Add restaurant</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="r-name">Name</Label>
              <Input
                id="r-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Neighborhood spot"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-cuisine">Cuisine / tags</Label>
              <Input
                id="r-cuisine"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                placeholder="Vietnamese, vegan-friendly…"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="r-menu">Menu notes (optional)</Label>
            <Textarea
              id="r-menu"
              rows={3}
              value={menuNotes}
              onChange={(e) => setMenuNotes(e.target.value)}
              placeholder="Dishes you order, dietary notes…"
              className="font-mono text-sm"
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={addRestaurant}
            disabled={pending || !name.trim()}
          >
            Save restaurant
          </Button>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Saved</h3>
          {restaurants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No restaurants yet. Add one above.
            </p>
          ) : (
            <ul className="space-y-2">
              {restaurants.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium">{r.name}</span>
                    {r.cuisine ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {r.cuisine}
                      </span>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => removeRestaurant(r.id)}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-medium">This week&apos;s pick</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Day</Label>
              <Select
                value={String(pickDay)}
                onValueChange={(v) => {
                  if (v) setPickDay(Number.parseInt(v, 10));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 7 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {getDayLabel(i)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Meal</Label>
              <Select
                value={pickMeal}
                onValueChange={(v) => v && setPickMeal(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEALS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Restaurant</Label>
              <Select
                value={selectedRestaurantId || "__none__"}
                onValueChange={(v) => {
                  if (!v || v === "__none__") {
                    applyPick(null);
                  } else {
                    applyPick(v);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {restaurants.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Changing day or meal updates which slot you are editing. Picking a
            restaurant saves immediately for that slot.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
