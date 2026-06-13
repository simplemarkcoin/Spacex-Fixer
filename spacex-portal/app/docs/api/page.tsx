import { getApiDocs } from '@/swagger.config';
import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default async function ApiDocPage() {
  const spec = await getApiDocs();

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-neutral-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-3xl border border-neutral-800 bg-white p-4 shadow-2xl shadow-black/30">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">Docs</p>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Swagger API documentation</h1>
          <p className="mt-1 text-sm text-neutral-700">This page keeps the interactive API docs in the docs section for easier access.</p>
        </div>
        <SwaggerUI spec={spec} />
      </section>
    </main>
  );
}
