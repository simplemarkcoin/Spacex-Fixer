import Link from 'next/link'

export default function DocsHomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-12 text-neutral-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-3xl border border-neutral-800 bg-neutral-900/90 p-8 shadow-2xl shadow-black/30">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Docs</p>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">Project docs in one easy place</h1>
          <p className="max-w-2xl text-neutral-300">
            The main markdown guides stay in the project root, and the interactive pages now live under the docs and playground areas for easier navigation.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/docs/api" className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6 transition hover:border-emerald-400/70 hover:bg-neutral-900">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Interactive</p>
            <h2 className="mt-3 text-xl font-semibold text-white">API Swagger docs</h2>
            <p className="mt-2 text-sm text-neutral-300">Open the Swagger UI for the member API routes.</p>
          </Link>

          <Link href="/playground" className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6 transition hover:border-emerald-400/70 hover:bg-neutral-900">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Testing</p>
            <h2 className="mt-3 text-xl font-semibold text-white">API playground</h2>
            <p className="mt-2 text-sm text-neutral-300">Use the existing member API to test responses and member creation.</p>
          </Link>
        </div>

        <section className="rounded-3xl border border-neutral-800 bg-black/30 p-6">
          <h2 className="text-xl font-semibold text-white">Docs files to keep</h2>
          <ul className="mt-4 grid gap-3 text-sm text-neutral-300 md:grid-cols-2">
            <li>• API-QUICKSTART.md — quick API overview and examples</li>
            <li>• API-LAYER-SUMMARY.md — implementation summary</li>
            <li>• DATABASE.md — schema and setup notes</li>
            <li>• README.md — project overview and guidance</li>
          </ul>
        </section>
      </section>
    </main>
  )
}
