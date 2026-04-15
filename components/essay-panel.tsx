"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { upsertEssay } from "@/app/actions/week";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";

type EssayRow = {
  id: string;
  weekStart: string;
  title: string;
  dueAt: string | null;
  status: string;
  notesJson: string;
};

type EssayPanelProps = {
  weekStart: string;
  essay: EssayRow | null;
};

function parseOutline(notesJson: string): string {
  try {
    const v = JSON.parse(notesJson) as unknown;
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
      return v.join("\n");
    }
  } catch {
    /* fall through */
  }
  return "";
}

function toNotesJson(outline: string): string {
  const lines = outline
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return JSON.stringify(lines);
}

export function EssayPanel({ weekStart, essay }: EssayPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(essay?.title ?? "");
  const [dueAt, setDueAt] = useState(
    essay?.dueAt ? essay.dueAt.slice(0, 10) : "",
  );
  const [status, setStatus] = useState(essay?.status ?? "draft");
  const [outline, setOutline] = useState(() =>
    parseOutline(essay?.notesJson ?? "[]"),
  );

  const onSave = () => {
    startTransition(async () => {
      await upsertEssay({
        weekStart,
        title,
        dueAt: dueAt || null,
        status,
        notesJson: toNotesJson(outline),
      });
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle>Essay</CardTitle>
            <CardDescription>
              Outline and status for this week&apos;s main writing goal.
            </CardDescription>
          </div>
          {essay ? (
            <Badge variant="secondary">Saved</Badge>
          ) : (
            <Badge variant="outline">Not started</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="essay-title">Title</Label>
          <Input
            id="essay-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Working title"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="essay-due">Due (optional)</Label>
            <Input
              id="essay-due"
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => v && setStatus(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="outlining">Outlining</SelectItem>
                <SelectItem value="drafting">Drafting</SelectItem>
                <SelectItem value="editing">Editing</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="essay-outline">Outline (one line per bullet)</Label>
          <Textarea
            id="essay-outline"
            rows={5}
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            placeholder="Thesis / main claim, then sections (one per line)"
            className="font-mono text-sm"
          />
        </div>
        <Button type="button" onClick={onSave} disabled={pending}>
          {pending ? "Saving…" : "Save essay"}
        </Button>
      </CardContent>
    </Card>
  );
}
