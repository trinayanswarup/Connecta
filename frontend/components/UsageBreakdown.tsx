import type { ReactNode } from "react";
import { AreaChart, BriefcaseBusiness, Map, Radio, Share2, Video, Wifi } from "lucide-react";

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
    <section className="rounded-lg border border-white/10 bg-zinc-950/70 p-5 shadow-xl shadow-black/20 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <AreaChart className="h-5 w-5 text-amber-300" />
            Usage breakdown
          </div>
          <p className="mt-1 text-sm text-zinc-500">Deterministic usage estimate by activity</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {labels.map(([key, label, icon]) => {
          const value = breakdown[key];
          const width = `${Math.max((value / maxValue) * 100, value > 0 ? 8 : 0)}%`;

          return (
            <div key={key} className="rounded-md border border-white/10 bg-white/[0.035] p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
                  <span className="text-emerald-200">{icon}</span>
                  {label}
                </div>
                <div className="text-sm font-semibold text-white">{value.toFixed(1)} GB</div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-emerald-300" style={{ width }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
