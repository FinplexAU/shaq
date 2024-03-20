import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@/drizzle/schema";

const getDb = async () => {
	const pool = new pg.Pool({
		connectionString: process.env.DATABASE_URL!,
	});

	const db = drizzle(pool, {
		schema,
	});

	// await migrate(db, { migrationsFolder: "drizzle/migrations" });
	return db;
};
export const drizzleDb = getDb();
