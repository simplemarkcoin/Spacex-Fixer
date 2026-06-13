import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required for Drizzle. Add it to your environment variables.');
}

const client = postgres(connectionString, {
  max: 1,
  prepare: false,
});

export const db = drizzle(client, { schema });

export type DrizzleDb = typeof db;
