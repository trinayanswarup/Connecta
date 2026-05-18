import Link from "next/link";
import { Activity, ArrowRight, CheckCircle2, Plane, Radar, Satellite } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden px-5 py-6 text-emerald-50 sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-48px)] max-w-7xl flex-col">
        <nav className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link className="flex items-center gap-3" href="/">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-emerald-300/30 bg-emerald-300/10">
              <Satellite className="h-4 w-4 text-emerald-200" />
            </span>
            <span className="text-lg font-semibold tracking-wide">Connecta</span>
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-300 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-[0_0_32px_rgba(52,211,153,0.18)] transition hover:bg-emerald-200"
            href="/trip/new"
          >
            Plan a trip
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>

        <div className="grid flex-1 gap-10 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-emerald-200">
              <Radar className="h-3.5 w-3.5" />
              Travel intelligence layer
            </div>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Connectivity planning for teams that move.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Connecta turns trip intent, usage patterns, plan coverage, and AI guide generation into a traceable recommendation before roaming costs surprise the itinerary.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-200"
                href="/trip/new"
              >
                Analyze connectivity
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-zinc-300">
                <Activity className="h-4 w-4 text-amber-300" />
                Observable agent trace
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950/75 shadow-2xl shadow-emerald-950/30 backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <Plane className="h-4 w-4 text-emerald-200" />
                  Japan business route
                </div>
                <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2.5 py-1 text-xs text-emerald-200">
                  Live analysis
                </span>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1fr_0.8fr]">
                <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Estimated", "11.4 GB", "usage model"],
                      ["Target", "14 GB", "safety buffer"],
                      ["Latency", "284 ms", "agent path"],
                      ["Confidence", "86%", "stable signal"]
                    ].map(([label, value, helper]) => (
                      <div key={label} className="rounded-md border border-white/10 bg-white/[0.035] p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
                        <div className="mt-1 text-xs text-zinc-400">{helper}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-emerald-100">MetroSignal Japan 15GB</div>
                        <p className="mt-1 text-sm leading-6 text-zinc-300">
                          Selected for coverage, allowance, validity, and measured safety margin.
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-semibold text-white">$21</div>
                        <div className="text-xs text-zinc-500">15 days</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-4 text-sm font-medium text-zinc-300">Agent execution</div>
                  <div className="space-y-3">
                    {[
                      ["Usage estimation", "completed"],
                      ["Plan optimization", "completed"],
                      ["AI guide generation", "fallback ready"],
                      ["Save trip", "completed"]
                    ].map(([label, status]) => (
                      <div key={label} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full border border-emerald-300/30 bg-emerald-300/10">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" />
                        </span>
                        <div>
                          <div className="text-sm font-medium text-zinc-100">{label}</div>
                          <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">{status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
