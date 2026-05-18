import type { ReactNode } from "react";
import { Backpack, LifeBuoy, MapPinned, PlaneLanding, Route, Wifi } from "lucide-react";

import type { ConnectivityGuideResult } from "@/lib/graphql";

const sections: Array<[keyof ConnectivityGuideResult, string, ReactNode]> = [
  ["beforeDeparture", "Before departure", <Backpack className="h-4 w-4" key="before" />],
  ["airportSetup", "Airport setup", <PlaneLanding className="h-4 w-4" key="airport" />],
  ["offlineStrategy", "Offline strategy", <MapPinned className="h-4 w-4" key="offline" />],
  ["backupInternet", "Backup internet", <Wifi className="h-4 w-4" key="backup" />],
  ["emergencyAccess", "Emergency access", <LifeBuoy className="h-4 w-4" key="emergency" />]
];

export function ConnectivityGuide({ guide }: { guide: ConnectivityGuideResult }) {
  return (
    <section className="rounded-lg border border-white/10 bg-zinc-950/70 p-5 shadow-xl shadow-black/20 backdrop-blur">
      <div className="flex items-center gap-2 text-lg font-semibold text-white">
        <Route className="h-5 w-5 text-amber-300" />
        Connectivity guide
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {sections.map(([key, label, icon]) => (
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-4" key={key}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <span className="text-emerald-200">{icon}</span>
              {label}
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
              {guide[key].map((item) => (
                <li className="border-l border-emerald-300/30 pl-3" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
