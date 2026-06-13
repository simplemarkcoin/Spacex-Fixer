import { date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const membersTable = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  tier: text("tier").notNull().default("Explorer"),
  status: text("status").notNull().default("ACTIVE"),
  role: text("role").notNull().default("member"),
  title: text("title"),
  location: text("location"),
  memberSince: date("member_since"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const insertMemberSchema = createInsertSchema(membersTable, {
  email: z.email(),
  name: z.string().min(1),
  tier: z.enum(["Explorer", "Pioneer", "Vanguard"]).optional(),
  status: z.enum(["ACTIVE", "PENDING", "SUSPENDED"]).optional(),
  role: z.enum(["member", "admin"]).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectMemberSchema = createSelectSchema(membersTable);

export type Member = typeof membersTable.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
