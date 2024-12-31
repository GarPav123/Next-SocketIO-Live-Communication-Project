import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import "dotenv/config";

export const messages = pgTable("messages", {
	id: serial("id").primaryKey(),
	sender: varchar("sender", { length: 255 }),
	recipient: varchar("recipient", { length: 255 }),
	content: text("content"),
	created_at: timestamp("created_at").defaultNow(),
});

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
