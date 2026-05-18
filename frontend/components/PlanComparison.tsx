import type { ReactNode } from "react";
import { CheckCircle2, CircleDollarSign, Layers3, Timer } from "lucide-react";

import type { PlanOption } from "@/lib/graphql";

type PlanComparisonProps = {
  selected: PlanOption;
  alternatives: PlanOption[];
};

export function PlanComparison({ selected, alternatives }: PlanComparisonProps) {
  const plans = [selected, ...alternatives];

  return (
    <section className="rounded-lg border border-white/10 bg-zinc-950/70 p-5 shadow-xl shadow-black/20 backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <Layers3 className="h-5 w-5 text-emerald-200" />
            Plan comparison
          </div>
          <p className="mt-1 text-sm text-zinc-500">Ranked by the deterministic optimizer</p>
        </div>
        <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">{plans.length} candidates</span>
      </div>

      <div className="mt-5 grid gap-3">
        {plans.map((plan, index) => {
          const isSelected = plan.id === selected.id;

          return (
            <article
              className={[
                "rounded-lg border p-4 transition",
                isSelected
                  ? "border-emerald-300/30 bg-emerald-300/[0.08] shadow-lg shadow-emerald-950/20"
                  : "border-white/10 bg-white/[0.035]"
              ].join(" ")}
              key={plan.id}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-white">{plan.name}</h3>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-xs text-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Selected
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-500">
                        Option {index + 1}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{plan.provider}</p>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">{plan.tradeoff}</p>
                </div>

                <div className="grid min-w-64 grid-cols-3 gap-2 text-sm">
                  <PlanMetric label="Data" value={`${plan.dataGb} GB`} />
                  <PlanMetric icon={<CircleDollarSign className="h-3.5 w-3.5" />} label="Price" value={`$${plan.priceUsd.toFixed(2)}`} />
                  <PlanMetric icon={<Timer className="h-3.5 w-3.5" />} label="Valid" value={`${plan.validityDays}d`} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PlanMetric({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-zinc-500">
        {icon ? <span className="text-emerald-200">{icon}</span> : null}
        {label}
      </div>
      <div className="mt-1 font-semibold text-white">{value}</div>
    </div>
  );
}
