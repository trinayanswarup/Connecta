import type { UsageBreakdownResult } from "@/lib/graphql";

const labels: Array<[keyof UsageBreakdownResult, string]> = [
  ["maps", "Maps"],
  ["streaming", "Streaming"],
  ["socialMedia", "Social"],
  ["videoCalls", "Video calls"],
  ["hotspot", "Hotspot"],
  ["work", "Work"]
];

export function UsageBreakdown({ breakdown }: { breakdown: UsageBreakdownResult }) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Usage breakdown</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {labels.map(([key, label]) => (
          <div key={key} className="rounded-md border border-border p-3">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-1 text-xl font-semibold">{breakdown[key].toFixed(1)} GB</div>
          </div>
        ))}
      </div>
    </section>
  );
}
