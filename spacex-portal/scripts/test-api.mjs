/**
 * Automated API test runner — tests all endpoints on both APIs.
 *
 * Usage:
 *   node scripts/test-api.mjs                  # test portal (default)
 *   node scripts/test-api.mjs --express        # test express api-server
 *   node scripts/test-api.mjs --both           # test both
 *
 * Emails are timestamped so repeated runs never collide.
 */

const PORTAL_BASE  = 'http://localhost:3000/api'
const EXPRESS_BASE = 'http://localhost:80/api'

const ts = Date.now()
const run = (base, name) => new Runner(base, name, ts)

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

async function req(method, url, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(url, opts)
  let json
  try { json = await res.json() } catch { json = null }
  return { status: res.status, body: json }
}

// ─── Test runner ─────────────────────────────────────────────────────────────

class Runner {
  constructor(base, name, ts) {
    this.base  = base
    this.name  = name
    this.ts    = ts
    this.pass  = 0
    this.fail  = 0
    this.cases = []
  }

  assert(label, condition, actual) {
    if (condition) {
      this.pass++
      this.cases.push({ ok: true,  label })
    } else {
      this.fail++
      this.cases.push({ ok: false, label, actual: JSON.stringify(actual) })
    }
  }

  async run() {
    const { base, ts } = this
    const email = `test.${ts}@spacex.com`

    console.log(`\n${'═'.repeat(60)}`)
    console.log(` ${this.name}  (${base})`)
    console.log('═'.repeat(60))

    // ── Health ──────────────────────────────────────────────────
    if (base.includes(':80')) {
      const h = await req('GET', `${base}/healthz`)
      this.assert('GET /healthz → 200', h.status === 200, h)
      this.assert('GET /healthz → { status: "ok" }', h.body?.status === 'ok', h.body)
    }

    // ── List ────────────────────────────────────────────────────
    const list = await req('GET', `${base}/members`)
    this.assert('GET /members → 200', list.status === 200, list)
    this.assert('GET /members → ok:true, array', list.body?.ok === true && Array.isArray(list.body?.data), list.body)
    const initialCount = list.body?.data?.length ?? 0

    // ── Stats ───────────────────────────────────────────────────
    const stats = await req('GET', `${base}/members/stats`)
    this.assert('GET /members/stats → 200', stats.status === 200, stats)
    this.assert('GET /members/stats → has totalMembers', typeof stats.body?.data?.totalMembers === 'number', stats.body)

    // ── Create ──────────────────────────────────────────────────
    const created = await req('POST', `${base}/members`, {
      email,
      name: 'Test Member',
      tier: 'Explorer',
      status: 'ACTIVE',
      role: 'member',
      title: 'Test Engineer',
      location: 'Hawthorne, CA',
    })
    this.assert('POST /members → 201', created.status === 201, created)
    this.assert('POST /members → ok:true, has id', created.body?.ok === true && !!created.body?.data?.id, created.body)

    const id = created.body?.data?.id

    // ── Get by ID ────────────────────────────────────────────────
    const getOne = await req('GET', `${base}/members/${id}`)
    this.assert('GET /members/:id → 200', getOne.status === 200, getOne)
    this.assert('GET /members/:id → correct email', getOne.body?.data?.email === email, getOne.body)

    // ── List count increased ─────────────────────────────────────
    const list2 = await req('GET', `${base}/members`)
    this.assert('GET /members count +1 after create', list2.body?.data?.length === initialCount + 1, list2.body?.data?.length)

    // ── Update ───────────────────────────────────────────────────
    const updated = await req('PUT', `${base}/members/${id}`, {
      name: 'Test Member Updated',
      tier: 'Pioneer',
      status: 'PENDING',
    })
    this.assert('PUT /members/:id → 200', updated.status === 200, updated)
    this.assert('PUT /members/:id → name changed', updated.body?.data?.name === 'Test Member Updated', updated.body)
    this.assert('PUT /members/:id → tier changed', updated.body?.data?.tier === 'Pioneer', updated.body)

    // ── Search by name ───────────────────────────────────────────
    const search = await req('GET', `${base}/members/search?query=Test+Member+Updated`)
    this.assert('GET /members/search → 200', search.status === 200, search)
    this.assert('GET /members/search → finds updated member', (search.body?.data?.data ?? search.body?.data)?.some?.(m => m.id === id), search.body)

    // ── Search by status ─────────────────────────────────────────
    const searchStatus = await req('GET', `${base}/members/search?status=PENDING`)
    this.assert('GET /members/search?status=PENDING → ok', searchStatus.body?.ok === true, searchStatus.body)

    // ── Search no results ─────────────────────────────────────────
    const searchEmpty = await req('GET', `${base}/members/search?query=zzznomatch999`)
    const emptyData = searchEmpty.body?.data
    const emptyCount = Array.isArray(emptyData) ? emptyData.length : (emptyData?.data?.length ?? emptyData?.total ?? 0)
    this.assert('GET /members/search (no match) → empty', emptyCount === 0, searchEmpty.body)

    // ── Duplicate email ──────────────────────────────────────────
    const dup = await req('POST', `${base}/members`, {
      email, name: 'Dup', tier: 'Explorer', status: 'ACTIVE', role: 'member',
    })
    this.assert('POST duplicate email → 400', dup.status === 400, dup)
    this.assert('POST duplicate email → ok:false', dup.body?.ok === false, dup.body)
    this.assert('POST duplicate email → code field present', !!dup.body?.code, dup.body)

    // ── Missing required field ───────────────────────────────────
    const bad = await req('POST', `${base}/members`, { name: 'No Email' })
    this.assert('POST missing email → 400', bad.status === 400, bad)
    this.assert('POST missing email → ok:false', bad.body?.ok === false, bad.body)

    // ── Bad enum value ────────────────────────────────────────────
    const badEnum = await req('POST', `${base}/members`, {
      email: `badenum.${ts}@spacex.com`, name: 'Bad', tier: 'Galactic', status: 'ACTIVE', role: 'member',
    })
    this.assert('POST bad enum → 400', badEnum.status === 400, badEnum)

    // ── 404 on unknown ID ─────────────────────────────────────────
    const notFound = await req('GET', `${base}/members/00000000-0000-0000-0000-000000000000`)
    this.assert('GET /members/:id unknown → 404', notFound.status === 404, notFound)
    this.assert('GET /members/:id unknown → ok:false', notFound.body?.ok === false, notFound.body)

    // ── Delete ────────────────────────────────────────────────────
    const deleted = await req('DELETE', `${base}/members/${id}`)
    this.assert('DELETE /members/:id → 200', deleted.status === 200, deleted)
    this.assert('DELETE /members/:id → ok:true', deleted.body?.ok === true, deleted.body)
    this.assert('DELETE /members/:id → returns id', deleted.body?.data?.id === id, deleted.body)

    // ── Confirm deleted ────────────────────────────────────────────
    const afterDel = await req('GET', `${base}/members/${id}`)
    this.assert('GET deleted member → 404', afterDel.status === 404, afterDel)

    // ── List count restored ─────────────────────────────────────
    const list3 = await req('GET', `${base}/members`)
    this.assert('GET /members count back to original after delete', list3.body?.data?.length === initialCount, list3.body?.data?.length)

    this.report()
  }

  report() {
    const total = this.pass + this.fail
    console.log()
    for (const c of this.cases) {
      const icon = c.ok ? '✓' : '✗'
      const line = c.ok ? `  ${icon}  ${c.label}` : `  ${icon}  ${c.label}\n       actual: ${c.actual}`
      console.log(line)
    }
    console.log()
    const status = this.fail === 0 ? 'PASS' : 'FAIL'
    const bar    = this.fail === 0 ? '✓' : '✗'
    console.log(`  ${bar}  ${status}  ${this.pass}/${total} passed${this.fail > 0 ? `  (${this.fail} failed)` : ''}`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const both    = args.includes('--both')
const express = args.includes('--express')

const runners = []
if (!express || both) runners.push(run(PORTAL_BASE,  'Portal  (Next.js 14 · Neon)'))
if (express  || both) runners.push(run(EXPRESS_BASE, 'Express (api-server)'))

let exitCode = 0
for (const r of runners) {
  try {
    await r.run()
    if (r.fail > 0) exitCode = 1
  } catch (err) {
    console.error(`\n  ✗  Runner crashed: ${err.message}`)
    exitCode = 1
  }
}

if (runners.length > 1) {
  const totalPass = runners.reduce((s, r) => s + r.pass, 0)
  const totalFail = runners.reduce((s, r) => s + r.fail, 0)
  const total = totalPass + totalFail
  console.log(`\n${'═'.repeat(60)}`)
  console.log(` OVERALL  ${totalFail === 0 ? '✓ ALL PASS' : '✗ FAILURES'}  ${totalPass}/${total}`)
  console.log('═'.repeat(60))
}

process.exit(exitCode)
