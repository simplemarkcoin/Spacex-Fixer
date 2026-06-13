/**
 * Database connection — the one and only place the DB client is created.
 *
 * Swap the database by changing DATABASE_URL in .env.local.
 * Works with any PostgreSQL-compatible provider (Neon, Supabase, Replit DB, local PG, etc.)
 */

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import { config } from '@/lib/config'

const pool = new Pool({ connectionString: config.databaseUrl })

export const db = drizzle(pool, { schema })
