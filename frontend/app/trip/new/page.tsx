import Link from "next/link";
import { ArrowLeft, Globe2, ShieldCheck, SignalHigh, Smartphone } from "lucide-react";

import { TripForm } from "@/components/TripForm";

type NewTripPageProps = {
  searchParams?: Promise<{
    destination?: string;
    startDate?: string;
    endDate?: string;
  }>;
};

export default async function NewTripPage({ searchParams }: NewTripPageProps) {
  const params = await searchParams;
  const initialDestination =
    typeof params?.destination === "string" && params.destination.trim().length >= 2
      ? params.destination.trim()
      : undefined;
  const initialStartDate = isIsoDate(params?.startDate) ? params?.startDate : undefined;
  const initialEndDate = isIsoDate(params?.endDate) ? params?.endDate : undefined;

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-5 py-6 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-10 flex items-center justify-between border-b border-slate-200/80 pb-5">
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950" href="/">
            <ArrowLeft className="h-4 w-4" />
            Connecta
          </Link>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            Travel data plans
          </span>
        </nav>

        <section className="pb-12 pt-4 lg:pb-16">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold text-teal-700">Travel eSIM planner</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.02] text-slate-950 sm:text-6xl">
              Find the travel data plan that fits your trip.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Tell us where you are going and how you use your phone. Connecta keeps the choice calm, clear, and ready before departure.
            </p>
            <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
              {plannerBenefits.map((benefit) => (
                <div className="grid grid-cols-[auto_1fr] gap-4 py-4" key={benefit.title}>
                  <span className="mt-1 grid h-9 w-9 place-items-center rounded-md bg-teal-50 text-teal-700">{benefit.icon}</span>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">{benefit.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{benefit.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TripForm
          initialDestination={initialDestination}
          initialEndDate={initialEndDate}
          initialStartDate={initialStartDate}
        />
      </div>
    </main>
  );
}

const plannerBenefits = [
  {
    icon: <Smartphone className="h-4 w-4" />,
    title: "Setup before departure",
    text: "Install your eSIM while you still have Wi-Fi at home."
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: "Avoid roaming surprises",
    text: "See data, validity, and total price before you choose."
  },
  {
    icon: <SignalHigh className="h-4 w-4" />,
    title: "Compare plans clearly",
    text: "Get a best match with alternatives when you want options."
  },
  {
    icon: <Globe2 className="h-4 w-4" />,
    title: "Works globally",
    text: "Plan around one country or a trip that crosses regions."
  }
];

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
