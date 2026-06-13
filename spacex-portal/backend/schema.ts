/**
 * Database schema — the single source of truth for the members table.
 *
 * Edit this file to change columns, then run:
 *   npm run db:push    — apply changes to the DB immediately (dev)
 *   npm run db:migrate — generate + apply a migration file (prod)
 */

import { date, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  tier: text('tier').notNull().default('Explorer'),
  status: text('status').notNull().default('ACTIVE'),
  role: text('role').notNull().default('member'),
  title: text('title'),
  location: text('location'),
  memberSince: date('member_since'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type MemberRow = typeof members.$inferSelect
export type MemberInsertRow = typeof members.$inferInsert
