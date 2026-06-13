/**
 * Single configuration object for the entire app.
 * All env vars are read here — never use process.env directly elsewhere.
 */

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Add it to .env.local:\n  DATABASE_URL=postgresql://user:pass@host/db'
  )
}

export const config = {
  databaseUrl: process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isDev: process.env.NODE_ENV !== 'production',
} as const
