import { CheckCircle2 } from "lucide-react";

import type { PlanOption } from "@/lib/graphql";

type PlanComparisonProps = {
  selected: PlanOption;
  alternatives: PlanOption[];
};

export function PlanComparison({ selected, alternatives }: PlanComparisonProps) {
  const plans = alternatives.length > 0 ? alternatives : [selected];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-64px_rgba(15,23,42,0.5)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Compare nearby plans</h2>
          <p className="mt-2 text-sm text-slate-500">Other options worth considering before you choose.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">{plans.length} plans</span>
      </div>

      <div className="mt-5 grid gap-3">
        {plans.map((plan) => {
          return (
            <article
              className="rounded-lg border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_18px_58px_-48px_rgba(15,23,42,0.45)]"
              key={plan.id}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-950">{plan.name}</h3>
                    {plan.id === selected.id ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Best match
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{plan.provider}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{plan.tradeoff}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm md:min-w-64">
                  <PlanMetric label="Data" value={`${plan.dataGb} GB`} />
                  <PlanMetric label="Price" value={`$${plan.priceUsd.toFixed(2)}`} />
                  <PlanMetric label="Valid" value={`${plan.validityDays}d`} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PlanMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-[#fbfaf7] p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-semibold text-slate-950">{value}</div>
    </div>
  );
}

