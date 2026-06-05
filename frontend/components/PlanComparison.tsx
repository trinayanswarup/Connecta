import type { PlanOption } from "@/lib/graphql";

type PlanComparisonProps = {
  selected: PlanOption;
  alternatives: PlanOption[];
};

export function PlanComparison({ selected, alternatives }: PlanComparisonProps) {
  const option = bestAlternativeForUsage(selected, alternatives);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-64px_rgba(15,23,42,0.5)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Other option</h2>
          <p className="mt-2 text-sm text-slate-500">One more plan that may suit your usage.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">1 option</span>
      </div>

      <div className="mt-5 grid gap-3">
        <article className="rounded-lg border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_18px_58px_-48px_rgba(15,23,42,0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-950">{option.name}</h3>
              </div>
              <p className="mt-1 text-sm text-slate-500">{option.provider}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{option.tradeoff}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm md:min-w-64">
              <PlanMetric label="Data" value={`${option.dataGb} GB`} />
              <PlanMetric label="Price" value={`$${option.priceUsd.toFixed(2)}`} />
              <PlanMetric label="Valid" value={`${option.validityDays}d`} />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function bestAlternativeForUsage(selected: PlanOption, alternatives: PlanOption[]) {
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
    <div className="rounded-md border border-slate-200 bg-[#fbfaf7] p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-semibold text-slate-950">{value}</div>
    </div>
  );
}

