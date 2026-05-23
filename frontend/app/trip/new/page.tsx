import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

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

        <section className="grid gap-10 pb-12 pt-4 lg:grid-cols-[0.68fr_1.32fr] lg:items-start lg:pb-16">
          <div className="lg:sticky lg:top-8">
            <p className="text-sm font-semibold text-orange-700">Travel eSIM planner</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.05] text-slate-950 sm:text-5xl">
              Find a travel data plan before you fly.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              A few trip details are enough to compare data, validity, price, and setup steps in one calm place.
            </p>
            <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
              {plannerBenefits.map((benefit) => (
                <div className="grid grid-cols-[auto_1fr] gap-4 py-5" key={benefit.title}>
                  <span className="mt-1 grid h-10 w-10 place-items-center rounded-md bg-[#f6e6d7] text-slate-700">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">{benefit.title}</h2>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{benefit.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <TripForm
            initialDestination={initialDestination}
            initialEndDate={initialEndDate}
            initialStartDate={initialStartDate}
          />
        </section>
      </div>
    </main>
  );
}

const plannerBenefits = [
  {
    title: "Setup before departure",
    text: "Install your eSIM while you still have Wi-Fi at home."
  },
  {
    title: "Avoid roaming surprises",
    text: "See data, validity, and total price before you choose."
  },
  {
    title: "Compare plans clearly",
    text: "Get a best match with alternatives when you want options."
  },
  {
    title: "Works globally",
    text: "Plan around one country or a trip that crosses regions."
  }
];

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

