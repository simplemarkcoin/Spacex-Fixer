import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-3xl border border-neutral-800 bg-neutral-900/90 p-8 shadow-2xl shadow-black/30">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">SpaceX Member Portal</p>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">A cleaner project layout for the app, docs, and API testing</h1>
          <p className="max-w-2xl text-neutral-300">
            The main project docs remain in the root folder, while the interactive pages are now grouped under clear sections: docs and playground.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/playground" className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6 transition hover:border-emerald-400/70 hover:bg-neutral-900">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Testing</p>
            <h2 className="mt-3 text-xl font-semibold text-white">API Playground</h2>
            <p className="mt-2 text-sm text-neutral-300">Use the member API directly from a dedicated test page.</p>
          </Link>

          <Link href="/docs" className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6 transition hover:border-emerald-400/70 hover:bg-neutral-900">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Docs</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Docs Hub</h2>
            <p className="mt-2 text-sm text-neutral-300">Open the Swagger page and project guides from one place.</p>
          </Link>
        </div>

        <section className="rounded-3xl border border-neutral-800 bg-black/30 p-6">
          <h2 className="text-xl font-semibold text-white">What changed</h2>
          <ul className="mt-4 grid gap-3 text-sm text-neutral-300 md:grid-cols-2">
            <li>• The interactive API tester now lives under /playground.</li>
            <li>• The Swagger page now lives under /docs/api.</li>
            <li>• The main docs markdown files in the project root are still kept intact.</li>
            <li>• Existing routes still work, and the old docs path redirects to the new docs section.</li>
          </ul>
        </section>
      </section>
    </main>
  )
}

