import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({
	path: ".env.local",
});

export default defineConfig({
	schema: "./drizzle/schema.ts",
	driver: "pg",
	dbCredentials: {
		connectionString: process.env.DATABASE_URL!,
	},
	verbose: true,
	strict: true,
	out: "./drizzle/migrations",
});
