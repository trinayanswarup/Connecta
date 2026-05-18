import type { ConnectivityGuideResult } from "@/lib/graphql";

const sections: Array<[keyof ConnectivityGuideResult, string]> = [
  ["beforeDeparture", "Before departure"],
  ["airportSetup", "Airport setup"],
  ["offlineStrategy", "Offline strategy"],
  ["backupInternet", "Backup internet"],
  ["emergencyAccess", "Emergency access"]
];

export function ConnectivityGuide({ guide }: { guide: ConnectivityGuideResult }) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Connectivity guide</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {sections.map(([key, label]) => (
          <div key={key}>
            <h3 className="text-sm font-semibold">{label}</h3>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
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
