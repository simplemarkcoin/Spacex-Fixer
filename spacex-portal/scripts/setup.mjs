/**
 * One-command setup for any PostgreSQL database.
 * Run: node scripts/setup.mjs
 *
 * Steps:
 *   1. Validate DATABASE_URL is set
 *   2. Push the schema  (drizzle-kit push)
 *   3. Seed the data    (seed.mjs)
 *
 * DATABASE_URL is read from (in order):
 *   1. Environment variable already set in the shell
 *   2. .env.local file in the project root
 */

import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root  = resolve(__dir, '..')

// ── Load .env.local if DATABASE_URL not already set ──────────────────────────
if (!process.env.DATABASE_URL) {
  const envPath = resolve(root, '.env.local')
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim()
      if (key) process.env[key] = val
    }
  }
}

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set.')
  console.error('')
  console.error('  Option A — add to .env.local:')
  console.error('    DATABASE_URL=postgresql://user:pass@host/db')
  console.error('')
  console.error('  Option B — export in your shell:')
  console.error('    export DATABASE_URL=postgresql://user:pass@host/db')
  process.exit(1)
}

function step(label, fn) {
  console.log(`\n── ${label} ${'─'.repeat(50 - label.length)}`)
  fn()
}

step('Step 1/2: Push schema', () => {
  execSync('node_modules/.bin/drizzle-kit push --force', {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  })
})

step('Step 2/2: Seed data', () => {
  execSync('node scripts/seed.mjs', {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  })
})

console.log('\n✓  Setup complete. Start the app with: pnpm dev\n')
