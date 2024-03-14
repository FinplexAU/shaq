import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const getDb = async () => {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL!,
  });
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: "drizzle/migrations" });
  return db;
};
export const drizzleDb = getDb();

export const safeDb = async <T>(
  prom: (() => Promise<T>) | Promise<T>,
): Promise<{ success: true; data: T } | { success: false; error: any }> => {
  const p = typeof prom === "function" ? prom() : prom;
  return p
    .then((data) => ({ success: true, data }) as const)
    .catch((error) => ({ success: false, error }) as const);
};
