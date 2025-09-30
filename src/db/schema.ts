import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Table for users
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  created: integer("created", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(strftime('%s','now') * 1000)`),
  modified: integer("modified", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(strftime('%s','now') * 1000)`),
});

export const cities = sqliteTable("cities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ubigeo_code: text("ubigeo_code").notNull().unique(), // e.g., '1501' for Provincia de Lima, or '0401' for Provincia de Arequipa
  name: text("name").notNull(),
});

export const districts = sqliteTable("districts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ubigeo_code: text("ubigeo_code").notNull().unique(), // e.g., '150101' for Distrito de Lima
  name: text("name").notNull(),
  cityId: integer("city_id")
    .notNull()
    .references(() => cities.id, { onDelete: "cascade" }),
});
// Events table
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  organizer: text("organizer"),
  eventDate: integer("event_date", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(strftime('%s','now') * 1000)`),
  userId: integer("user_id")
    .notNull()
    .default(1)
    .references(() => users.id, { onDelete: "cascade" }),
  created: integer("created", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(strftime('%s','now') * 1000)`),
  modified: integer("modified", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(strftime('%s','now') * 1000)`),
  deleted: integer("deleted", { mode: "timestamp_ms" }),
  cityId: integer("city_id")
    .notNull()
    .references(() => cities.id),
  districtId: integer("district_id")
    .notNull()
    .references(() => districts.id),
  imageSource: text("image_source"), // Original filename
  imageUrl: text("image_url"), // R2 public URL
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  eventDateIdx: index("event_date_idx").on(table.eventDate),

}));
