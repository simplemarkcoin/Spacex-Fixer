/**
 * Seed the database with SpaceX member data.
 * Run: node scripts/seed.mjs
 * Safe to run multiple times — uses ON CONFLICT DO NOTHING.
 *
 * DATABASE_URL is read from (in order):
 *   1. Environment variable already set in the shell
 *   2. .env.local file in the project root
 */

import pg from 'pg'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))

// Load .env.local only if DATABASE_URL isn't already in the environment
if (!process.env.DATABASE_URL) {
  const envPath = resolve(__dir, '../.env.local')
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
  console.error('  Set it in .env.local or export it in your shell before running this script.')
  process.exit(1)
}

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const MEMBERS = [
  {
    email: 'gwynne@spacex.com',
    name: 'Gwynne Shotwell',
    tier: 'Vanguard',
    status: 'ACTIVE',
    role: 'admin',
    title: 'President & COO',
    location: 'Hawthorne, CA',
    member_since: '2002-09-01',
  },
  {
    email: 'tom@spacex.com',
    name: 'Tom Mueller',
    tier: 'Vanguard',
    status: 'ACTIVE',
    role: 'member',
    title: 'VP Propulsion',
    location: 'Hawthorne, CA',
    member_since: '2003-06-01',
  },
  {
    email: 'hans@spacex.com',
    name: 'Hans Koenigsmann',
    tier: 'Pioneer',
    status: 'ACTIVE',
    role: 'member',
    title: 'VP Build & Flight Reliability',
    location: 'Cape Canaveral, FL',
    member_since: '2006-03-15',
  },
  {
    email: 'larry@spacex.com',
    name: 'Larry Williams',
    tier: 'Pioneer',
    status: 'ACTIVE',
    role: 'member',
    title: 'Director of Launch Operations',
    location: 'Kennedy Space Center, FL',
    member_since: '2010-07-04',
  },
  {
    email: 'sarah@spacex.com',
    name: 'Sarah Chen',
    tier: 'Explorer',
    status: 'ACTIVE',
    role: 'member',
    title: 'Avionics Engineer',
    location: 'Hawthorne, CA',
    member_since: '2019-01-14',
  },
  {
    email: 'marcus@spacex.com',
    name: 'Marcus Rivera',
    tier: 'Explorer',
    status: 'ACTIVE',
    role: 'member',
    title: 'Propulsion Engineer',
    location: 'McGregor, TX',
    member_since: '2020-03-22',
  },
  {
    email: 'priya@spacex.com',
    name: 'Priya Nair',
    tier: 'Explorer',
    status: 'PENDING',
    role: 'member',
    title: 'Software Engineer',
    location: 'Hawthorne, CA',
    member_since: null,
  },
  {
    email: 'dmitri@spacex.com',
    name: 'Dmitri Volkov',
    tier: 'Explorer',
    status: 'PENDING',
    role: 'member',
    title: 'Structural Engineer',
    location: 'Boca Chica, TX',
    member_since: null,
  },
  {
    email: 'aisha@spacex.com',
    name: 'Aisha Thompson',
    tier: 'Pioneer',
    status: 'ACTIVE',
    role: 'member',
    title: 'Mission Integration Lead',
    location: 'Houston, TX',
    member_since: '2015-11-30',
  },
  {
    email: 'jake@spacex.com',
    name: 'Jake Morrison',
    tier: 'Explorer',
    status: 'SUSPENDED',
    role: 'member',
    title: 'Ground Systems Tech',
    location: 'Cape Canaveral, FL',
    member_since: '2021-06-01',
  },
]

async function seed() {
  console.log('Connecting to database…')
  const client = await pool.connect()

  try {
    console.log('Seeding members table…\n')

    let inserted = 0
    let skipped = 0

    for (const m of MEMBERS) {
      const result = await client.query(
        `INSERT INTO members (email, name, tier, status, role, title, location, member_since)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [m.email, m.name, m.tier, m.status, m.role, m.title, m.location, m.member_since],
      )

      if (result.rowCount > 0) {
        console.log(`  ✓  ${m.name} <${m.email}>`)
        inserted++
      } else {
        console.log(`  –  ${m.name} <${m.email}>  (already exists)`)
        skipped++
      }
    }

    const { rows } = await client.query('SELECT COUNT(*) FROM members')
    console.log(`\nDone. Inserted: ${inserted}  Skipped: ${skipped}  Total in DB: ${rows[0].count}`)
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
