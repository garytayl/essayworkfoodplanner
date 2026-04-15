import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

import * as schema from "./schema";

export type AppDb = LibSQLDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  __kwhDb?: AppDb | null;
};

/**
 * Remote libSQL (e.g. Turso) or local file URL. On Vercel, a file-based URL is
 * not reliable; set DATABASE_URL to a hosted libsql URL.
 */
export function getDatabaseUrl(): string | null {
  const explicit = process.env.DATABASE_URL?.trim();
  if (explicit) return explicit;
  // Hosted Vercel (production serverless): no writable local SQLite; require Turso etc.
  const isHostedVercelProd =
    Boolean(process.env.VERCEL) && process.env.NODE_ENV === "production";
  if (isHostedVercelProd) return null;
  return "file:./local.db";
}

export function getDb(): AppDb | null {
  const url = getDatabaseUrl();
  if (!url) return null;

  if (globalForDb.__kwhDb !== undefined) {
    return globalForDb.__kwhDb;
  }

  try {
    const client = createClient({ url });
    globalForDb.__kwhDb = drizzle(client, { schema });
  } catch {
    globalForDb.__kwhDb = null;
  }

  return globalForDb.__kwhDb ?? null;
}

export function requireDb(): AppDb {
  const d = getDb();
  if (!d) {
    throw new Error(
      "Database is not configured. On Vercel, set DATABASE_URL to your Turso (or other libSQL) URL. See README.",
    );
  }
  return d;
}
