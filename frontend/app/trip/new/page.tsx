import { TripForm } from "@/components/TripForm";
import Link from "next/link";
import { ArrowLeft, Satellite } from "lucide-react";

export default function NewTripPage() {
  return (
    <main className="min-h-screen px-5 py-6 text-emerald-50 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
          <Link className="inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white" href="/">
            <ArrowLeft className="h-4 w-4" />
            Connecta
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-emerald-200">
            <Satellite className="h-3.5 w-3.5" />
            Phase 4 console
          </span>
        </nav>

        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-200">
            Connectivity command center
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-white sm:text-5xl">
            Analyze trip data before the route goes live.
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-300">
            Tune the itinerary, usage profile, and budget guardrail. Connecta returns the deterministic plan decision, AI-enhanced guidance when available, and the full agent trace.
          </p>
        </div>

        <TripForm />
      </div>
    </main>
  );
}
