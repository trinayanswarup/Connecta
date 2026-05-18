import type { TripAnalysis } from "@/lib/graphql";

type RecommendationCardProps = {
  analysis: TripAnalysis;
};

export function RecommendationCard({ analysis }: RecommendationCardProps) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Recommended plan</p>
          <h2 className="mt-2 text-2xl font-semibold">{analysis.selectedPlan.name}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {analysis.recommendation}
          </p>
        </div>
        <div className="grid min-w-52 grid-cols-2 gap-3 text-sm">
          <Metric label="Data" value={`${analysis.selectedPlan.dataGb} GB`} />
          <Metric label="Price" value={`$${analysis.selectedPlan.priceUsd.toFixed(2)}`} />
          <Metric label="Estimate" value={`${analysis.estimatedGb.toFixed(1)} GB`} />
          <Metric label="Target" value={`${analysis.recommendedGb.toFixed(0)} GB`} />
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
