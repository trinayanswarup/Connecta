"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe2, ShieldCheck, Smartphone, Wifi } from "lucide-react";

import type { DestinationOption, MarketingPlan } from "@/lib/destination-catalog";

type CountryPlanSelectorProps = {
  destination: DestinationOption;
  plans: MarketingPlan[];
  startDate?: string;
  endDate?: string;
};

export function CountryPlanSelector({ destination, plans, startDate, endDate }: CountryPlanSelectorProps) {
  const initialIndex = Math.max(
    0,
    plans.findIndex((plan) => plan.bestChoice)
  );
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const selectedPlan = plans[selectedIndex] ?? plans[0];

  const plannerHref = useMemo(() => {
    const params = new URLSearchParams({
      destination: destination.name,
      selectedData: selectedPlan.data,
      selectedValidity: selectedPlan.days
    });

    if (startDate) {
      params.set("startDate", startDate);
    }
    if (endDate) {
      params.set("endDate", endDate);
    }

    return `/trip/new?${params.toString()}`;
  }, [destination.name, endDate, selectedPlan.data, selectedPlan.days, startDate]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
      <section className="rounded-lg border border-orange-100 bg-white p-4 shadow-[0_24px_90px_-72px_rgba(15,23,42,0.5)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-700">Choose your data plan</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{destination.name} eSIM plans</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-500">
            Pick a data size and validity window. You can still compare recommendations before checkout.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan, index) => {
            const isSelected = selectedIndex === index;
            return (
              <button
                className={`group relative min-h-44 overflow-hidden rounded-lg border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_18px_60px_-48px_rgba(15,23,42,0.55)] ${
                  isSelected ? "border-slate-950 ring-1 ring-slate-950" : "border-slate-200 hover:border-orange-200"
                }`}
                key={`${plan.data}-${plan.days}`}
                onClick={() => setSelectedIndex(index)}
                type="button"
              >
                {plan.bestChoice ? (
                  <span className="absolute inset-x-0 top-0 bg-slate-950 py-2 text-center text-xs font-semibold text-white">Best choice</span>
                ) : null}
                <span
                  className={`flex h-4 w-4 rounded-full border ${
                    plan.bestChoice ? "mt-8" : ""
                  } ${isSelected ? "border-slate-950 bg-slate-950" : "border-slate-300"}`}
                >
                  {isSelected ? <span className="m-auto h-1.5 w-1.5 rounded-full bg-white" /> : null}
                </span>
                <span className="mt-6 block text-2xl font-semibold text-slate-950">{plan.data}</span>
                <span className="mt-4 block text-base text-slate-500">{plan.days}</span>
                <span className="mt-5 block text-lg font-semibold text-slate-950">{plan.price}</span>
                <span className="mt-3 inline-flex rounded-full bg-[#fff4e8] px-3 py-1 text-xs font-medium text-orange-800">
                  3% in Connecta credits
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="rounded-lg border border-orange-100 bg-[#fffaf4] p-5 shadow-[0_24px_90px_-74px_rgba(15,23,42,0.55)] lg:sticky lg:top-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Selected plan</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">{destination.name}</h3>
          </div>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-orange-700 shadow-sm">
            {destination.kind === "country" ? <Wifi className="h-5 w-5" /> : <Globe2 className="h-5 w-5" />}
          </span>
        </div>

        <div className="mt-6 rounded-lg bg-white p-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Travel data</p>
              <p className="mt-1 text-4xl font-semibold text-slate-950">{selectedPlan.data}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">{selectedPlan.days}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">{selectedPlan.price}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 text-sm font-medium text-slate-700">
          <span className="flex items-center gap-3 rounded-md bg-white px-3 py-3">
            <CheckCircle2 className="h-4 w-4 text-orange-700" />
            Install before you leave
          </span>
          <span className="flex items-center gap-3 rounded-md bg-white px-3 py-3">
            <Smartphone className="h-4 w-4 text-orange-700" />
            Keep your regular number
          </span>
          <span className="flex items-center gap-3 rounded-md bg-white px-3 py-3">
            <ShieldCheck className="h-4 w-4 text-orange-700" />
            Clear setup guide included
          </span>
        </div>

        <Link
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          href={plannerHref}
        >
          Continue to planner
          <ArrowRight className="h-4 w-4" />
        </Link>
      </aside>
    </div>
  );
}
