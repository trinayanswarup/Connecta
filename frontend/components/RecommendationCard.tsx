import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, CircleDollarSign, SignalHigh } from "lucide-react";

import type { TripAnalysis } from "@/lib/graphql";

type RecommendationCardProps = {
  analysis: TripAnalysis;
  checkoutHref?: string;
};

export function RecommendationCard({ analysis, checkoutHref }: RecommendationCardProps) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_100px_-78px_rgba(15,23,42,0.6)] ring-1 ring-slate-200/80">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_0.54fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
            <CheckCircle2 className="h-4 w-4" />
            Recommended
          </div>
          <h2 className="mt-5 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">{analysis.selectedPlan.name}</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">{analysis.recommendation}</p>
          {checkoutHref ? (
            <Link
              className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_18px_54px_-36px_rgba(15,23,42,0.72)] transition-colors duration-200 hover:bg-slate-800"
              href={checkoutHref}
            >
              Choose this plan
            </Link>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] bg-[#fff4e8] p-6 text-slate-950 ring-1 ring-orange-100/80">
          <div className="text-sm text-slate-500">{analysis.selectedPlan.provider}</div>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <div className="text-5xl font-semibold">${analysis.selectedPlan.priceUsd.toFixed(2)}</div>
              <div className="mt-1 text-sm text-slate-500">{analysis.selectedPlan.validityDays} days</div>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm">
              {analysis.selectedPlan.dataGb} GB
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{analysis.selectedPlan.tradeoff}</p>
        </div>
      </div>

      <div className="grid gap-3 bg-[#fbfaf7] p-5 sm:grid-cols-3 sm:p-6">
        <PlanFact icon={<SignalHigh className="h-4 w-4" />} label="Data included" value={`${analysis.selectedPlan.dataGb} GB`} />
        <PlanFact icon={<CalendarDays className="h-4 w-4" />} label="Valid for" value={`${analysis.selectedPlan.validityDays} days`} />
        <PlanFact icon={<CircleDollarSign className="h-4 w-4" />} label="Total price" value={`$${analysis.selectedPlan.priceUsd.toFixed(2)}`} />
      </div>
    </section>
  );
}

function PlanFact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1rem] bg-white p-4 shadow-[0_12px_44px_-38px_rgba(15,23,42,0.55)] ring-1 ring-slate-200/80">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-950">{value}</div>
    </div>
  );
}

