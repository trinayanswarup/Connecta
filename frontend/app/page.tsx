import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <nav className="flex items-center justify-between">
          <span className="text-lg font-semibold">Connecta</span>
          <Link
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
            href="/trip/new"
          >
            Plan a trip
          </Link>
        </nav>

        <div className="grid gap-6 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              AI-native travel connectivity planner
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight">
              Plan mobile data before your trip gets expensive.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Estimate usage, compare eSIM-style plans, and generate setup guidance with an observable agent workflow.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Phase 1 scaffold</div>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p>Next.js frontend foundation</p>
              <p>Go backend package boundaries</p>
              <p>GraphQL schema contract</p>
              <p>Supabase relational schema</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
