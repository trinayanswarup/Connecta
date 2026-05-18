import type { ReactNode } from "react";
import { BadgeCheck, BrainCircuit, CircleDollarSign, Gauge, ShieldCheck, SignalHigh } from "lucide-react";

import type { TripAnalysis } from "@/lib/graphql";

type RecommendationCardProps = {
  analysis: TripAnalysis;
};

export function RecommendationCard({ analysis }: RecommendationCardProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-emerald-300/20 bg-zinc-950/80 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <div className="border-b border-white/10 bg-emerald-300/[0.06] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-emerald-200">
              <BadgeCheck className="h-3.5 w-3.5" />
              Recommended route
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-white">
              {analysis.selectedPlan.name}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">
              {analysis.recommendation}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/30 p-4 lg:min-w-72">
            <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">Provider</div>
            <div className="mt-2 text-xl font-semibold text-white">{analysis.selectedPlan.provider}</div>
            <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-emerald-100">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
              {analysis.selectedPlan.tradeoff}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
        <Metric icon={<SignalHigh className="h-4 w-4" />} label="Plan data" value={`${analysis.selectedPlan.dataGb} GB`} />
        <Metric icon={<CircleDollarSign className="h-4 w-4" />} label="Plan price" value={`$${analysis.selectedPlan.priceUsd.toFixed(2)}`} />
        <Metric icon={<Gauge className="h-4 w-4" />} label="Estimated usage" value={`${analysis.estimatedGb.toFixed(1)} GB`} />
        <Metric icon={<BrainCircuit className="h-4 w-4" />} label="Recommended target" value={`${analysis.recommendedGb.toFixed(0)} GB`} />
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-zinc-500">
        <span className="text-emerald-200">{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}
