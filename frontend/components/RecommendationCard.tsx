import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, CalendarDays, CheckCircle2, CircleDollarSign, SignalHigh } from "lucide-react";

import type { TripAnalysis } from "@/lib/graphql";

type RecommendationCardProps = {
  analysis: TripAnalysis;
  checkoutHref?: string;
  manualChoiceHref?: string;
};

export function RecommendationCard({ analysis, checkoutHref, manualChoiceHref }: RecommendationCardProps) {
  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-[0_30px_100px_-78px_rgba(15,23,42,0.6)] ring-1 ring-slate-200/80">
      <div className="grid gap-7 p-6 sm:p-7 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
            <CheckCircle2 className="h-4 w-4" />
            Recommended
          </div>
          <h2 className="mt-4 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">{analysis.selectedPlan.name}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{analysis.recommendation}</p>
          {checkoutHref || manualChoiceHref ? (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {checkoutHref ? (
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_18px_54px_-36px_rgba(15,23,42,0.72)] transition-colors duration-200 hover:bg-slate-800"
                  href={checkoutHref}
                >
                  Choose this plan
                </Link>
              ) : null}
              {manualChoiceHref ? (
                <Link
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors duration-200 hover:border-orange-200 hover:bg-orange-50"
                  href={manualChoiceHref}
                >
                  Choose your own
                  <ArrowDown className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-md bg-[#fff4e8] p-5 text-slate-950 ring-1 ring-orange-100/80">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-slate-500">{analysis.selectedPlan.provider}</div>
              <div className="mt-3 text-4xl font-semibold tracking-tight">${analysis.selectedPlan.priceUsd.toFixed(2)}</div>
              <div className="mt-1 text-sm text-slate-500">{analysis.selectedPlan.validityDays} days included</div>
            </div>
            <div className="rounded-md bg-white px-3 py-2 text-sm font-semibold leading-tight text-orange-700 shadow-sm ring-1 ring-orange-100">
              {analysis.selectedPlan.dataGb} GB
            </div>
          </div>
          <div className="my-4 h-px bg-orange-200/60" />
          <p className="text-sm leading-6 text-slate-600">{analysis.selectedPlan.tradeoff}</p>
        </div>
      </div>

      <div className="grid gap-3 border-t border-slate-100 bg-[#fbfaf7] p-4 sm:grid-cols-3 sm:p-5">
        <PlanFact icon={<SignalHigh className="h-4 w-4" />} label="Data included" value={`${analysis.selectedPlan.dataGb} GB`} />
        <PlanFact icon={<CalendarDays className="h-4 w-4" />} label="Valid for" value={`${analysis.selectedPlan.validityDays} days`} />
        <PlanFact icon={<CircleDollarSign className="h-4 w-4" />} label="Total price" value={`$${analysis.selectedPlan.priceUsd.toFixed(2)}`} />
      </div>
    </section>
  );
}

function PlanFact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md bg-white p-4 ring-1 ring-slate-200/80">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-slate-950">{value}</div>
    </div>
  );
}

