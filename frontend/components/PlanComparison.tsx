import Link from "next/link";

import type { PlanOption } from "@/lib/graphql";

type PlanComparisonProps = {
  selected: PlanOption;
  alternatives: PlanOption[];
  checkoutHref?: string;
};

export function PlanComparison({ selected, alternatives, checkoutHref }: PlanComparisonProps) {
  const option = bestAlternativeForUsage(selected, alternatives);
  const optionData = option.dataLabel ?? `${option.dataGb} GB`;

  return (
    <section className="rounded-lg bg-white p-5 shadow-[0_20px_72px_-68px_rgba(15,23,42,0.42)] ring-1 ring-slate-200/70 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Compare another plan</h2>
          <p className="mt-2 text-sm text-slate-500">A nearby option if you want a different data size or price.</p>
        </div>
        <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">1 option</span>
      </div>

      <div className="mt-5 grid gap-3">
        <article className="rounded-md bg-[#fbfaf7] p-4 ring-1 ring-slate-200/70 transition-shadow duration-200 hover:ring-orange-200">
          <div className="grid gap-5 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-950">{option.name}</h3>
              </div>
              <p className="mt-1 text-sm text-slate-500">{option.provider}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{option.tradeoff}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm md:min-w-72">
              <PlanMetric label="Data" value={optionData} />
              <PlanMetric label="Price" value={`$${option.priceUsd.toFixed(2)}`} />
              <PlanMetric label="Valid" value={`${option.validityDays}d`} />
            </div>
            {checkoutHref ? (
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 transition-colors duration-200 hover:bg-orange-50 hover:ring-orange-200"
                href={checkoutHref}
              >
                Choose
              </Link>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}

export function bestAlternativeForUsage(selected: PlanOption, alternatives: PlanOption[]) {
  const usableAlternatives = alternatives.filter((plan) => plan.id !== selected.id);

  if (usableAlternatives.length === 0) {
    return selected;
  }

  return [...usableAlternatives].sort((first, second) => {
    const firstDistance = Math.abs(first.dataGb - selected.dataGb);
    const secondDistance = Math.abs(second.dataGb - selected.dataGb);

    if (firstDistance !== secondDistance) {
      return firstDistance - secondDistance;
    }

    return first.priceUsd - second.priceUsd;
  })[0];
}

function PlanMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white p-3 ring-1 ring-slate-200/80">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-semibold text-slate-950">{value}</div>
    </div>
  );
}

