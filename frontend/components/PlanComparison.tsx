import type { PlanOption } from "@/lib/graphql";

type PlanComparisonProps = {
  selected: PlanOption;
  alternatives: PlanOption[];
};

export function PlanComparison({ selected, alternatives }: PlanComparisonProps) {
  const plans = [selected, ...alternatives];

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Plan comparison</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b border-border text-slate-500">
            <tr>
              <th className="py-2 pr-4 font-medium">Plan</th>
              <th className="py-2 pr-4 font-medium">Provider</th>
              <th className="py-2 pr-4 font-medium">Data</th>
              <th className="py-2 pr-4 font-medium">Price</th>
              <th className="py-2 pr-4 font-medium">Validity</th>
              <th className="py-2 font-medium">Tradeoff</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-b border-border last:border-0">
                <td className="py-3 pr-4 font-medium">{plan.name}</td>
                <td className="py-3 pr-4">{plan.provider}</td>
                <td className="py-3 pr-4">{plan.dataGb} GB</td>
                <td className="py-3 pr-4">${plan.priceUsd.toFixed(2)}</td>
                <td className="py-3 pr-4">{plan.validityDays} days</td>
                <td className="py-3 text-slate-600">{plan.tradeoff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
