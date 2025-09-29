// src/schema.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const events = sqliteTable("events", {
	id: integer("id").primaryKey({
		autoIncrement: true,
	}),
	url: text("url").notNull(),
	title: text("title").notNull(),
	location: text("location").notNull(),
	date: text("date").notNull(),
	time: text("time").notNull(),
	description: text("description").notNull(),
	created: integer("created", {
		mode: "timestamp_ms",
	})
		.notNull()
		.$defaultFn(() => new Date()),
	modified: integer("modified", {
		mode: "timestamp_ms",
	})
		.notNull()
		.$defaultFn(() => new Date()),
	deleted: integer("deleted", {
		mode: "timestamp_ms",
	}),
});