"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { replaceTasksForWeek } from "@/app/actions/week";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type TaskItem = {
  id: string;
  weekStart: string;
  essayId: string | null;
  title: string;
  sortOrder: number;
  done: boolean;
};

type TaskListProps = {
  weekStart: string;
  tasks: TaskItem[];
  essayId: string | null;
};

type Row = {
  id: string;
  title: string;
  done: boolean;
  sortOrder: number;
  tieToEssay: boolean;
};

export function TaskList({ weekStart, tasks, essayId }: TaskListProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState<Row[]>(() =>
    tasks.map((t) => ({
      id: t.id,
      title: t.title,
      done: t.done,
      sortOrder: t.sortOrder,
      tieToEssay: Boolean(essayId && t.essayId === essayId),
    })),
  );

  const save = () => {
    startTransition(async () => {
      const trimmed = rows
        .map((r, i) => ({ ...r, sortOrder: i }))
        .filter((r) => r.title.trim().length > 0);
      await replaceTasksForWeek({
        weekStart,
        tasks: trimmed.map((r, i) => ({
          id: r.id,
          title: r.title.trim(),
          done: r.done,
          sortOrder: i,
          essayId: r.tieToEssay && essayId ? essayId : null,
        })),
      });
      router.refresh();
    });
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "",
        done: false,
        sortOrder: prev.length,
        tieToEssay: Boolean(essayId),
      },
    ]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const move = (index: number, dir: -1 | 1) => {
    setRows((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>
          Prioritized work for this week. Link items to the essay when it helps
          you batch related work.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tasks yet. Add one to get started.
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((row, index) => (
              <li
                key={row.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={row.done}
                    onCheckedChange={(v) =>
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id
                            ? { ...r, done: Boolean(v) }
                            : r,
                        ),
                      )
                    }
                    aria-label="Done"
                  />
                  <Input
                    value={row.title}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id
                            ? { ...r, title: e.target.value }
                            : r,
                        ),
                      )
                    }
                    placeholder="Task"
                    className="min-w-0 flex-1"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                  {essayId ? (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`tie-${row.id}`}
                        checked={row.tieToEssay}
                        onCheckedChange={(v) =>
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id
                                ? { ...r, tieToEssay: Boolean(v) }
                                : r,
                            ),
                          )
                        }
                      />
                      <Label
                        htmlFor={`tie-${row.id}`}
                        className="text-xs text-muted-foreground"
                      >
                        Essay
                      </Label>
                    </div>
                  ) : null}
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                    >
                      Up
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => move(index, 1)}
                      disabled={index === rows.length - 1}
                    >
                      Down
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(row.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={addRow}>
            Add task
          </Button>
          <Button type="button" onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save tasks"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
