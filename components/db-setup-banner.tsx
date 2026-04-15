import type { DashboardData } from "@/db/queries";

type Props = {
  data: DashboardData;
};

export function DbSetupBanner({ data }: Props) {
  if (!data.dbUnavailable) return null;

  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground"
    >
      <p className="font-medium">Database unavailable</p>
      <p className="mt-1 text-muted-foreground">
        {data.dbErrorMessage ??
          "Configure DATABASE_URL and run migrations (see README)."}
      </p>
      <p className="mt-2 text-muted-foreground">
        On Vercel, create a{" "}
        <a
          className="font-medium text-foreground underline underline-offset-2"
          href="https://turso.tech"
          target="_blank"
          rel="noreferrer"
        >
          Turso
        </a>{" "}
        database, add <code className="rounded bg-muted px-1 py-0.5">DATABASE_URL</code>{" "}
        in Project Settings → Environment Variables, then run{" "}
        <code className="rounded bg-muted px-1 py-0.5">npm run db:migrate</code>{" "}
        against that URL locally or in CI.
      </p>
    </div>
  );
}
