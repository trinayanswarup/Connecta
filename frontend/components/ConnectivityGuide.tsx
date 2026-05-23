import type { ReactNode } from "react";
import { Backpack, LifeBuoy, MapPinned, PlaneLanding, Wifi } from "lucide-react";

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
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-64px_rgba(15,23,42,0.5)] sm:p-6">
      <h2 className="text-2xl font-semibold text-slate-950">Setup guide</h2>
      <p className="mt-2 text-sm text-slate-500">What to do before departure and when you arrive.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {sections.map(([key, label, icon]) => (
          <div className="rounded-lg bg-[#f1f7ff] p-4" key={key}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <span className="text-teal-700">{icon}</span>
              {label}
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {guide[key].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
