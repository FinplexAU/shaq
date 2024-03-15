import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const getDb = async () => {
	const pool = new pg.Pool({
		connectionString: process.env.DATABASE_URL!,
	});
	const db = drizzle(pool);
	// await migrate(db, { migrationsFolder: "drizzle/migrations" });
	return db;
};
export const drizzleDb = getDb();
