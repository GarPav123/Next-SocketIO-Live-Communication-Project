"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.messages = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
require("dotenv/config");
exports.messages = (0, pg_core_1.pgTable)("messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    sender: (0, pg_core_1.varchar)("sender", { length: 255 }),
    recipient: (0, pg_core_1.varchar)("recipient", { length: 255 }),
    content: (0, pg_core_1.text)("content"),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
exports.db = (0, node_postgres_1.drizzle)(pool);
