import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Globe2, Plane, ShieldCheck, Smartphone } from "lucide-react";

import { CountryPlanSelector } from "@/components/CountryPlanSelector";
import { findDestinationBySlug, plansForDestination } from "@/lib/destination-catalog";

type DestinationPageProps = {
  params: Promise<{
    destination: string;
  }>;
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
  }>;
};

export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const { destination: destinationSlug } = await params;
  const destination = findDestinationBySlug(destinationSlug);

  if (!destination) {
    return {
      title: "Connecta eSIM plans"
    };
  }

  return {
    title: `${destination.name} eSIM plans | Connecta`,
    description: `Compare travel eSIM data plans for ${destination.name}.`
  };
}

export default async function DestinationEsimPage({ params, searchParams }: DestinationPageProps) {
  const { destination: destinationSlug } = await params;
  const { startDate, endDate } = await searchParams;
  const destination = findDestinationBySlug(destinationSlug);

  if (!destination) {
    notFound();
  }

  const plans = plansForDestination(destination.name);
  const destinationType = destination.kind === "global" ? "Global travel data" : destination.kind === "regional" ? "Regional travel data" : "Local travel data";

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-950">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-orange-700" href="/">
          <ArrowLeft className="h-4 w-4" />
          Connecta
        </Link>
        <Link
          className="hidden rounded-md border border-orange-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 sm:inline-flex"
          href="/trip/new"
        >
          Travel data planner
        </Link>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-10 pt-4 sm:px-8 lg:pb-14">
        <div className="grid gap-8 rounded-lg border border-orange-100 bg-[#fff4e8] p-5 shadow-[0_34px_120px_-94px_rgba(15,23,42,0.55)] sm:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-orange-700">{destinationType}</p>
            <h1 className="mt-3 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-slate-950 sm:text-6xl">
              {destination.name} eSIM, ready before you land.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700">
              Choose a data plan for {destination.name}, keep your regular SIM active, and arrive with clear travel data options before roaming gets expensive.
            </p>

            <div className="mt-7 grid gap-3 text-sm font-semibold text-slate-800 sm:grid-cols-2">
              <span className="inline-flex items-center gap-3 rounded-md bg-white/75 px-3 py-3">
                <CheckCircle2 className="h-4 w-4 text-orange-700" />
                No physical SIM swap
              </span>
              <span className="inline-flex items-center gap-3 rounded-md bg-white/75 px-3 py-3">
                <ShieldCheck className="h-4 w-4 text-orange-700" />
                Avoid roaming surprises
              </span>
              <span className="inline-flex items-center gap-3 rounded-md bg-white/75 px-3 py-3">
                <Smartphone className="h-4 w-4 text-orange-700" />
                Keep your number
              </span>
              <span className="inline-flex items-center gap-3 rounded-md bg-white/75 px-3 py-3">
                <Globe2 className="h-4 w-4 text-orange-700" />
                Works across {destination.region}
              </span>
            </div>
          </div>

          <div className="relative flex min-h-[22rem] overflow-hidden rounded-lg bg-slate-950 p-px shadow-[0_30px_90px_-72px_rgba(15,23,42,0.65)]">
            <div className="relative z-10 flex flex-1 flex-col justify-center rounded-[7px] bg-white p-5 text-slate-950 sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-orange-700">Connecta eSIM</p>
                <span className="rounded-md bg-[#fff4e8] px-3 py-1 text-xs font-semibold text-orange-700">Instant setup</span>
              </div>
              <h2 className="mt-5 text-3xl font-semibold">{destination.name} Explorer</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Choose data, confirm dates, and prepare setup before departure.</p>
              <div className="mt-6 rounded-lg bg-[#f8fafc] p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Popular plan</p>
                    <p className="mt-1 text-4xl font-semibold">{plans.find((plan) => plan.bestChoice)?.data ?? plans[0]?.data}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">from</p>
                    <p className="mt-1 text-2xl font-semibold">{plans[0]?.price}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-2 text-sm font-medium text-slate-700">
                <span className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-orange-700" />
                  Travel ready in minutes
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-700" />
                  Clear alternatives before checkout
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <CountryPlanSelector destination={destination} endDate={endDate} plans={plans} startDate={startDate} />
      </section>
    </main>
  );
}
