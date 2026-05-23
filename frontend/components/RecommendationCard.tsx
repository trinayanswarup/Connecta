import type { ReactNode } from "react";
import { CalendarDays, CheckCircle2, CircleDollarSign, Gauge, SignalHigh } from "lucide-react";

import type { TripAnalysis } from "@/lib/graphql";

type RecommendationCardProps = {
  analysis: TripAnalysis;
};

export function RecommendationCard({ analysis }: RecommendationCardProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_28px_90px_-68px_rgba(15,23,42,0.55)]">
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_0.62fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
            <CheckCircle2 className="h-4 w-4" />
            Best match for your trip
          </div>
          <h2 className="mt-5 text-4xl font-semibold leading-tight text-slate-950">{analysis.selectedPlan.name}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{analysis.recommendation}</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#fff4e8] px-3 py-2 text-sm font-medium text-slate-700">
            <Gauge className="h-4 w-4 text-orange-600" />
            {Math.round(analysis.confidence * 100)}% match confidence
          </div>
        </div>

        <div className="rounded-lg border border-orange-100 bg-[#fff4e8] p-5 text-slate-950">
          <div className="text-sm text-slate-500">{analysis.selectedPlan.provider}</div>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <div className="text-4xl font-semibold">${analysis.selectedPlan.priceUsd.toFixed(2)}</div>
              <div className="mt-1 text-sm text-slate-500">{analysis.selectedPlan.validityDays} days</div>
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-orange-700 shadow-sm">
              {analysis.selectedPlan.dataGb} GB
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{analysis.selectedPlan.tradeoff}</p>
        </div>
      </div>

      <div className="grid gap-3 border-t border-slate-100 bg-[#fbfaf7] p-5 sm:grid-cols-3 sm:p-6">
        <PlanFact icon={<SignalHigh className="h-4 w-4" />} label="Data included" value={`${analysis.selectedPlan.dataGb} GB`} />
        <PlanFact icon={<CalendarDays className="h-4 w-4" />} label="Valid for" value={`${analysis.selectedPlan.validityDays} days`} />
        <PlanFact icon={<CircleDollarSign className="h-4 w-4" />} label="Total price" value={`$${analysis.selectedPlan.priceUsd.toFixed(2)}`} />
      </div>
    </section>
  );
}

function PlanFact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-950">{value}</div>
    </div>
  );
}

