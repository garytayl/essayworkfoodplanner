import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatWeekRangeLabel, shiftWeek } from "@/lib/week";

type WeekNavProps = {
  weekStart: string;
};

export function WeekNav({ weekStart }: WeekNavProps) {
  const prev = shiftWeek(weekStart, -1);
  const next = shiftWeek(weekStart, 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Week of
        </p>
        <p className="text-lg font-semibold tracking-tight">
          {formatWeekRangeLabel(weekStart)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          href={`/?week=${prev}`}
          prefetch
        >
          Previous
        </Link>
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          href={`/?week=${next}`}
          prefetch
        >
          Next
        </Link>
        <Link
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          href="/"
        >
          This week
        </Link>
      </div>
    </div>
  );
}
