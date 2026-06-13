'use client'

import { useCallback, useEffect, useState } from 'react'
import { createMember, getMemberStats } from '@/frontend/api'
import { isFailure, isSuccess } from '@/frontend/response'

const initialForm = {
  email: 'new-member@example.com',
  name: 'New API Member',
  tier: 'Explorer',
  status: 'ACTIVE',
  role: 'member',
  title: 'Test User',
  location: 'Austin, TX',
  member_since: new Date().toISOString().slice(0, 10),
}

export default function PlaygroundPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getMemberStats>>['data'] | null>(null)
  const [form, setForm] = useState(initialForm)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await getMemberStats()

    if (isSuccess(result)) {
      setStats(result.data)
    } else if (isFailure(result)) {
      setError(result.error.message)
      setStats(null)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  const handleCreateMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreating(true)
    setMessage('Creating member…')

    const result = await createMember({
      email: form.email,
      name: form.name,
      tier: form.tier as 'Explorer' | 'Pioneer' | 'Vanguard',
      status: form.status as 'ACTIVE' | 'PENDING' | 'SUSPENDED',
      role: form.role as 'member' | 'admin',
      title: form.title || null,
      location: form.location || null,
      member_since: form.member_since || null,
    })

    if (isSuccess(result)) {
      setMessage(`Member created: ${result.data.name} (${result.data.email})`)
      setForm(initialForm)
      await loadStats()
    } else if (isFailure(result)) {
      setMessage(result.error.message)
    }

    setCreating(false)
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-100">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 shadow-2xl shadow-black/30">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">API Playground</p>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">Test the member API from a single page</h1>
          <p className="max-w-2xl text-neutral-300">
            This page uses the member API directly and is a simple place to verify reads and writes with the current Supabase setup.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void loadStats()}
            className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-300"
          >
            Refresh stats
          </button>
          <a
            href="/docs"
            className="rounded-full border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-100 transition hover:border-neutral-500"
          >
            View docs
          </a>
        </div>

        <article className="grid gap-6 rounded-2xl border border-neutral-800 bg-black/30 p-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div>
              <h2 className="text-xl font-semibold text-white">Create a member</h2>
              <p className="text-sm text-neutral-300">Fill in the form and submit to insert a member record through the API. You must be signed in as an admin user for the create path to succeed.</p>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateMember}>
              <label className="flex flex-col gap-1 text-sm text-neutral-200">
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none ring-0 transition focus:border-emerald-400"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-neutral-200">
                Name
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-neutral-200">
                Tier
                <select
                  value={form.tier}
                  onChange={(event) => setForm((prev) => ({ ...prev, tier: event.target.value }))}
                  className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none transition focus:border-emerald-400"
                >
                  <option>Explorer</option>
                  <option>Pioneer</option>
                  <option>Vanguard</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm text-neutral-200">
                Status
                <select
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                  className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none transition focus:border-emerald-400"
                >
                  <option>ACTIVE</option>
                  <option>PENDING</option>
                  <option>SUSPENDED</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm text-neutral-200">
                Role
                <select
                  value={form.role}
                  onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                  className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none transition focus:border-emerald-400"
                >
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm text-neutral-200">
                Member since
                <input
                  type="date"
                  value={form.member_since}
                  onChange={(event) => setForm((prev) => ({ ...prev, member_since: event.target.value }))}
                  className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-neutral-200 md:col-span-2">
                Title
                <input
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-neutral-200 md:col-span-2">
                Location
                <input
                  value={form.location}
                  onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                  className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none transition focus:border-emerald-400"
                />
              </label>

              <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {creating ? 'Creating…' : 'Add member via API'}
                </button>
                <button
                  type="button"
                  onClick={() => setForm(initialForm)}
                  className="rounded-full border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-100 transition hover:border-neutral-500"
                >
                  Reset form
                </button>
              </div>
            </form>

            {message ? <p className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100">{message}</p> : null}
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">API result</p>

            {loading ? (
              <p className="mt-3 text-neutral-200">Calling getMemberStats()…</p>
            ) : error ? (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-semibold text-rose-300">Request failed</p>
                <p className="text-sm text-neutral-200">{error}</p>
                <p className="text-xs text-neutral-400">If permissions or credentials are missing, the API will report that here instead of crashing.</p>
              </div>
            ) : stats ? (
              <div className="mt-3 space-y-3 text-sm text-neutral-200">
                <p><span className="text-neutral-400">Total members:</span> {stats.totalMembers}</p>
                <p><span className="text-neutral-400">Active:</span> {stats.activeMembers}</p>
                <p><span className="text-neutral-400">Pending:</span> {stats.pendingMembers}</p>
                <p><span className="text-neutral-400">Suspended:</span> {stats.suspendedMembers}</p>
                <p><span className="text-neutral-400">Admins:</span> {stats.adminCount}</p>
                <p><span className="text-neutral-400">Tiers:</span> Explorer {stats.tierBreakdown.explorer}, Pioneer {stats.tierBreakdown.pioneer}, Vanguard {stats.tierBreakdown.vanguard}</p>
              </div>
            ) : null}
          </div>
        </article>
      </section>
    </main>
  )
}
