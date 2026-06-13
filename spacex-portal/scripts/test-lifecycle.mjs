/**
 * Lifecycle test — follows one member through the full journey:
 *
 *   JOIN (Explorer/PENDING)
 *    → ACTIVATE (PENDING → ACTIVE)
 *    → PROFILE (set title, location, member_since)
 *    → TIER UP (Explorer → Pioneer)      ← verify via fresh GET + stats + search
 *    → TIER UP (Pioneer  → Vanguard)     ← verify via fresh GET + stats + search
 *    → PROMOTE (member   → admin)
 *    → SUSPEND (ACTIVE   → SUSPENDED)
 *    → REINSTATE (SUSPENDED → ACTIVE)
 *    → CLEANUP (delete and confirm counts restored)
 *
 * Every state change is confirmed by a fresh GET from the database —
 * not just the PUT response — so a caching or rollback bug would be caught.
 *
 * Usage:
 *   node scripts/test-lifecycle.mjs               # portal (default)
 *   node scripts/test-lifecycle.mjs --express     # express api-server
 */

const isExpress = process.argv.includes('--express')
const BASE = isExpress ? 'http://localhost:80/api' : 'http://localhost:3000/api'
const TARGET = isExpress ? 'Express api-server' : 'Next.js Portal (Neon)'

// ─── helpers ─────────────────────────────────────────────────────────────────

async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}${path}`, opts)
  let json
  try { json = await res.json() } catch { json = null }
  return { status: res.status, body: json }
}

const get  = (path)        => api('GET',    path)
const post = (path, body)  => api('POST',   path, body)
const put  = (path, body)  => api('PUT',    path, body)
const del  = (path)        => api('DELETE', path)

// ─── assertion engine ─────────────────────────────────────────────────────────

const results = []
let stepName = ''

function step(name) {
  stepName = name
  console.log(`\n  ── ${name}`)
}

function check(label, pass, { got, want } = {}) {
  const ok = Boolean(pass)
  results.push({ ok, step: stepName, label })
  if (ok) {
    console.log(`     ✓  ${label}`)
  } else {
    const detail = (got !== undefined || want !== undefined)
      ? `  (wanted: ${JSON.stringify(want)}, got: ${JSON.stringify(got)})`
      : ''
    console.log(`     ✗  ${label}${detail}`)
  }
}

function eq(a, b, label) {
  check(label, a === b, { got: a, want: b })
}

// ─── main lifecycle ───────────────────────────────────────────────────────────

async function run() {
  const ts    = Date.now()
  const email = `alex.chen.${ts}@spacex.com`

  console.log(`\n${'═'.repeat(64)}`)
  console.log(`  Member Lifecycle Test`)
  console.log(`  Target : ${TARGET}`)
  console.log(`  Member : ${email}`)
  console.log('═'.repeat(64))

  // ── Baseline stats before we start ────────────────────────────────────────
  step('0 · Baseline stats')
  const baseStats = await get('/members/stats')
  check('GET /members/stats → 200', baseStats.status === 200)
  const base = baseStats.body?.data
  check('Stats object returned', !!base)

  const initialTotal     = base?.totalMembers     ?? 0
  const initialActive    = base?.activeMembers    ?? 0
  const initialPending   = base?.pendingMembers   ?? 0
  const initialSuspended = base?.suspendedMembers ?? 0
  const initialExplorer  = base?.tierBreakdown?.explorer ?? 0
  const initialPioneer   = base?.tierBreakdown?.pioneer  ?? 0
  const initialVanguard  = base?.tierBreakdown?.vanguard ?? 0
  const initialAdmins    = base?.adminCount       ?? 0

  console.log(`     ℹ  total=${initialTotal} active=${initialActive} pending=${initialPending}`)
  console.log(`     ℹ  explorer=${initialExplorer} pioneer=${initialPioneer} vanguard=${initialVanguard}`)

  // ── Step 1: Member applies ─────────────────────────────────────────────────
  step('1 · JOIN — Alex applies as Explorer / PENDING')
  const joined = await post('/members', {
    email,
    name: 'Alex Chen',
    tier: 'Explorer',
    status: 'PENDING',
    role: 'member',
  })
  eq(joined.status, 201, 'POST /members → 201')
  check('Response ok:true',   joined.body?.ok === true)
  check('Has UUID id',        /^[0-9a-f-]{36}$/.test(joined.body?.data?.id ?? ''))
  eq(joined.body?.data?.tier,   'Explorer', 'tier = Explorer')
  eq(joined.body?.data?.status, 'PENDING',  'status = PENDING')
  eq(joined.body?.data?.role,   'member',   'role = member')

  const id = joined.body?.data?.id
  if (!id) { console.log('\n  ✗  Cannot continue — member creation failed.\n'); process.exit(1) }

  // verify stats: pending +1, explorer +1
  const s1 = (await get('/members/stats')).body?.data
  eq(s1?.pendingMembers,         initialPending + 1,   'stats: pendingMembers +1')
  eq(s1?.tierBreakdown?.explorer, initialExplorer + 1, 'stats: explorer +1')
  eq(s1?.totalMembers,           initialTotal + 1,     'stats: totalMembers +1')

  // ── Step 2: Application approved ───────────────────────────────────────────
  step('2 · ACTIVATE — application approved (PENDING → ACTIVE)')
  const activated = await put(`/members/${id}`, { status: 'ACTIVE' })
  eq(activated.status, 200, 'PUT status=ACTIVE → 200')

  // confirm with fresh GET
  const afterActivate = (await get(`/members/${id}`)).body?.data
  eq(afterActivate?.status, 'ACTIVE',   'DB confirms: status = ACTIVE')
  eq(afterActivate?.tier,   'Explorer', 'DB confirms: tier unchanged = Explorer')

  // stats: pending -1, active +1
  const s2 = (await get('/members/stats')).body?.data
  eq(s2?.pendingMembers, initialPending,    'stats: pendingMembers back to baseline')
  eq(s2?.activeMembers,  initialActive + 1, 'stats: activeMembers +1')

  // ── Step 3: Profile complete ───────────────────────────────────────────────
  step('3 · PROFILE — title, location, member_since set')
  const profiled = await put(`/members/${id}`, {
    title: 'Avionics Engineer',
    location: 'Hawthorne, CA',
    member_since: '2024-01-15',
  })
  eq(profiled.status, 200, 'PUT profile fields → 200')

  const afterProfile = (await get(`/members/${id}`)).body?.data
  eq(afterProfile?.title,        'Avionics Engineer', 'DB confirms: title set')
  eq(afterProfile?.location,     'Hawthorne, CA',     'DB confirms: location set')
  eq(afterProfile?.member_since, '2024-01-15',        'DB confirms: member_since set')
  eq(afterProfile?.tier,         'Explorer',          'DB confirms: tier still Explorer')
  eq(afterProfile?.status,       'ACTIVE',            'DB confirms: status still ACTIVE')

  // ── Step 4: Tier upgrade → Pioneer ────────────────────────────────────────
  step('4 · TIER UP — Explorer → Pioneer (demonstrated performance)')
  const toPioneer = await put(`/members/${id}`, { tier: 'Pioneer' })
  eq(toPioneer.status, 200, 'PUT tier=Pioneer → 200')

  // confirm via fresh GET — this is the critical check
  const afterPioneer = (await get(`/members/${id}`)).body?.data
  eq(afterPioneer?.tier,   'Pioneer', 'DB confirms: tier = Pioneer')
  eq(afterPioneer?.status, 'ACTIVE',  'DB confirms: status unchanged = ACTIVE')

  // stats: explorer -1, pioneer +1
  const s4 = (await get('/members/stats')).body?.data
  eq(s4?.tierBreakdown?.explorer, initialExplorer,    'stats: explorer back to baseline')
  eq(s4?.tierBreakdown?.pioneer,  initialPioneer + 1, 'stats: pioneer +1')
  eq(s4?.tierBreakdown?.vanguard, initialVanguard,    'stats: vanguard unchanged')

  // search: appears in Pioneer search, not Explorer
  const pioneerSearch  = await get('/members/search?tier=Pioneer')
  const explorerSearch = await get('/members/search?tier=Explorer')
  check(
    'Search tier=Pioneer finds Alex',
    (pioneerSearch.body?.data?.data ?? pioneerSearch.body?.data)?.some(m => m.id === id),
  )
  check(
    'Search tier=Explorer does NOT find Alex',
    !(explorerSearch.body?.data?.data ?? explorerSearch.body?.data)?.some(m => m.id === id),
  )

  // ── Step 5: Tier upgrade → Vanguard ───────────────────────────────────────
  step('5 · TIER UP — Pioneer → Vanguard (outstanding leadership)')
  const toVanguard = await put(`/members/${id}`, { tier: 'Vanguard' })
  eq(toVanguard.status, 200, 'PUT tier=Vanguard → 200')

  const afterVanguard = (await get(`/members/${id}`)).body?.data
  eq(afterVanguard?.tier,   'Vanguard', 'DB confirms: tier = Vanguard')
  eq(afterVanguard?.status, 'ACTIVE',   'DB confirms: status unchanged = ACTIVE')

  // stats: pioneer -1, vanguard +1
  const s5 = (await get('/members/stats')).body?.data
  eq(s5?.tierBreakdown?.pioneer,  initialPioneer,     'stats: pioneer back to baseline')
  eq(s5?.tierBreakdown?.vanguard, initialVanguard + 1, 'stats: vanguard +1')

  // search: appears in Vanguard, not Pioneer
  const vanguardSearch = await get('/members/search?tier=Vanguard')
  const pioneerSearch2 = await get('/members/search?tier=Pioneer')
  check(
    'Search tier=Vanguard finds Alex',
    (vanguardSearch.body?.data?.data ?? vanguardSearch.body?.data)?.some(m => m.id === id),
  )
  check(
    'Search tier=Pioneer does NOT find Alex',
    !(pioneerSearch2.body?.data?.data ?? pioneerSearch2.body?.data)?.some(m => m.id === id),
  )

  // ── Step 6: Role promotion to admin ───────────────────────────────────────
  step('6 · PROMOTE — member → admin')
  const promoted = await put(`/members/${id}`, { role: 'admin' })
  eq(promoted.status, 200, 'PUT role=admin → 200')

  const afterPromote = (await get(`/members/${id}`)).body?.data
  eq(afterPromote?.role,   'admin',    'DB confirms: role = admin')
  eq(afterPromote?.tier,   'Vanguard', 'DB confirms: tier unchanged = Vanguard')
  eq(afterPromote?.status, 'ACTIVE',   'DB confirms: status unchanged = ACTIVE')

  const s6 = (await get('/members/stats')).body?.data
  eq(s6?.adminCount, initialAdmins + 1, 'stats: adminCount +1')

  // ── Step 7: Suspend ───────────────────────────────────────────────────────
  step('7 · SUSPEND — policy violation (ACTIVE → SUSPENDED)')
  const suspended = await put(`/members/${id}`, { status: 'SUSPENDED' })
  eq(suspended.status, 200, 'PUT status=SUSPENDED → 200')

  const afterSuspend = (await get(`/members/${id}`)).body?.data
  eq(afterSuspend?.status, 'SUSPENDED', 'DB confirms: status = SUSPENDED')
  eq(afterSuspend?.tier,   'Vanguard',  'DB confirms: tier unchanged = Vanguard')
  eq(afterSuspend?.role,   'admin',     'DB confirms: role unchanged = admin')

  const s7 = (await get('/members/stats')).body?.data
  eq(s7?.suspendedMembers, initialSuspended + 1, 'stats: suspendedMembers +1')
  eq(s7?.activeMembers,    initialActive,        'stats: activeMembers back to baseline')

  // ── Step 8: Reinstate ─────────────────────────────────────────────────────
  step('8 · REINSTATE — cleared (SUSPENDED → ACTIVE)')
  const reinstated = await put(`/members/${id}`, { status: 'ACTIVE' })
  eq(reinstated.status, 200, 'PUT status=ACTIVE → 200')

  const afterReinstate = (await get(`/members/${id}`)).body?.data
  eq(afterReinstate?.status, 'ACTIVE',    'DB confirms: status = ACTIVE')
  eq(afterReinstate?.tier,   'Vanguard',  'DB confirms: tier unchanged = Vanguard')
  eq(afterReinstate?.role,   'admin',     'DB confirms: role unchanged = admin')
  eq(afterReinstate?.title,  'Avionics Engineer', 'DB confirms: title preserved through all changes')

  const s8 = (await get('/members/stats')).body?.data
  eq(s8?.activeMembers,    initialActive + 1,     'stats: activeMembers +1 again')
  eq(s8?.suspendedMembers, initialSuspended,       'stats: suspendedMembers back to baseline')
  eq(s8?.adminCount,       initialAdmins + 1,     'stats: adminCount still +1')
  eq(s8?.tierBreakdown?.vanguard, initialVanguard + 1, 'stats: vanguard still +1')

  // ── Step 9: Cleanup ───────────────────────────────────────────────────────
  step('9 · CLEANUP — delete member and verify counts restored')
  const deleted = await del(`/members/${id}`)
  eq(deleted.status, 200,  'DELETE /members/:id → 200')
  eq(deleted.body?.data?.id, id, 'DELETE returns the deleted id')

  // confirm 404
  const gone = await get(`/members/${id}`)
  eq(gone.status, 404, 'GET after delete → 404')

  // all stats should be back to baseline
  const sFinal = (await get('/members/stats')).body?.data
  eq(sFinal?.totalMembers,           initialTotal,     'stats: totalMembers = baseline')
  eq(sFinal?.activeMembers,          initialActive,    'stats: activeMembers = baseline')
  eq(sFinal?.adminCount,             initialAdmins,    'stats: adminCount = baseline')
  eq(sFinal?.tierBreakdown?.vanguard, initialVanguard, 'stats: vanguard = baseline')

  // ── Report ────────────────────────────────────────────────────────────────
  const passed = results.filter(r => r.ok).length
  const failed = results.filter(r => !r.ok).length
  const total  = results.length
  const status = failed === 0 ? 'PASS' : 'FAIL'

  console.log(`\n${'═'.repeat(64)}`)
  console.log(`  ${failed === 0 ? '✓' : '✗'}  ${status}  ${passed}/${total} checks passed${failed > 0 ? `  (${failed} failed)` : ''}`)
  console.log('═'.repeat(64))

  if (failed > 0) {
    console.log('\n  Failed checks:')
    results.filter(r => !r.ok).forEach(r => {
      console.log(`    ✗  [${r.step}] ${r.label}`)
    })
    console.log()
  }

  process.exit(failed > 0 ? 1 : 0)
}

run().catch(err => {
  console.error('\n  ✗  Test crashed:', err.message)
  process.exit(1)
})
