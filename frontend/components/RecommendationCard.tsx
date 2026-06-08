import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, CalendarDays, CircleDollarSign, ShieldCheck, SignalHigh } from "lucide-react";

import type { TripAnalysis } from "@/lib/graphql";

type RecommendationCardProps = {
  analysis: TripAnalysis;
  checkoutHref?: string;
  manualChoiceHref?: string;
};

export function RecommendationCard({ analysis, checkoutHref, manualChoiceHref }: RecommendationCardProps) {
  const selectedData = analysis.selectedPlan.dataLabel ?? `${analysis.selectedPlan.dataGb} GB`;

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-[0_30px_96px_-80px_rgba(15,23,42,0.52)] ring-1 ring-slate-200/70">
      <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Recommended for your trip
          </div>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">{analysis.selectedPlan.name}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{analysis.recommendation}</p>
          {checkoutHref || manualChoiceHref ? (
            <div className="mt-7 flex items-center gap-3">
              {checkoutHref ? (
                <Link
                  className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full bg-slate-950 px-8 text-sm font-semibold text-white shadow-[0_18px_54px_-36px_rgba(15,23,42,0.72)] transition-all duration-200 hover:bg-slate-800"
                  href={checkoutHref}
                >
                  Select this plan
                </Link>
              ) : null}
              {manualChoiceHref ? (
                <Link
                  className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-8 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-orange-200 hover:bg-orange-50"
                  href={manualChoiceHref}
                >
                  Choose your own
                  <ArrowDown className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border-2 border-orange-200 bg-orange-50/30 p-6 text-slate-950 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-slate-500">{analysis.selectedPlan.provider}</div>
              <div className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
                ${analysis.selectedPlan.priceUsd.toFixed(2)}
              </div>
              <div className="mt-1 text-sm text-slate-500">{analysis.selectedPlan.validityDays} days included</div>
            </div>
            <div className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-orange-700 shadow-sm ring-1 ring-orange-200">
              {selectedData}
            </div>
          </div>
          <div className="my-5 h-px bg-orange-200/60" />
          <p className="text-sm leading-6 text-slate-600">{analysis.selectedPlan.tradeoff}</p>
        </div>
      </div>

      <div className="grid gap-3 border-t border-slate-100 bg-[#FAFAF8] p-4 sm:grid-cols-3 sm:p-6">
        <PlanFact icon={<SignalHigh className="h-4 w-4" />} label="Data included" value={selectedData} />
        <PlanFact icon={<CalendarDays className="h-4 w-4" />} label="Valid for" value={`${analysis.selectedPlan.validityDays} days`} />
        <PlanFact icon={<CircleDollarSign className="h-4 w-4" />} label="Total price" value={`$${analysis.selectedPlan.priceUsd.toFixed(2)}`} />
      </div>
    </section>
  );
}

function PlanFact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/80">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-lg font-bold text-slate-950">{value}</div>
    </div>
  );
}
