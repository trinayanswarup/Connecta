import type { ReactNode } from "react";
import { BriefcaseBusiness, Map, Radio, Share2, Video, Wifi } from "lucide-react";

import type { UsageBreakdownResult } from "@/lib/graphql";

const labels: Array<[keyof UsageBreakdownResult, string, ReactNode]> = [
  ["maps", "Maps", <Map className="h-4 w-4" key="maps" />],
  ["streaming", "Streaming", <Radio className="h-4 w-4" key="streaming" />],
  ["socialMedia", "Social", <Share2 className="h-4 w-4" key="social" />],
  ["videoCalls", "Video calls", <Video className="h-4 w-4" key="video" />],
  ["hotspot", "Hotspot", <Wifi className="h-4 w-4" key="hotspot" />],
  ["work", "Work", <BriefcaseBusiness className="h-4 w-4" key="work" />]
];

export function UsageBreakdown({ breakdown }: { breakdown: UsageBreakdownResult }) {
  const maxValue = Math.max(...labels.map(([key]) => breakdown[key]), 1);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-64px_rgba(15,23,42,0.5)] sm:p-6">
      <h2 className="text-2xl font-semibold text-slate-950">Your expected data use</h2>
      <p className="mt-2 text-sm text-slate-500">A simple estimate based on how you use your phone.</p>
      <div className="mt-5 grid gap-3">
        {labels.map(([key, label, icon]) => {
          const value = breakdown[key];
          const width = `${Math.max((value / maxValue) * 100, value > 0 ? 7 : 0)}%`;

          return (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-orange-700">{icon}</span>
                  {label}
                </div>
                <span className="font-medium text-slate-950">{value.toFixed(1)} GB</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-orange-500" style={{ width }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

