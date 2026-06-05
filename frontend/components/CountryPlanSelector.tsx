"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgePercent, Info } from "lucide-react";

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
  const tripDays = tripLengthDays(startDate, endDate);
  const initialUnlimitedDays = nearestUnlimitedValidity(plans, tripDays);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [unlimitedDays, setUnlimitedDays] = useState(initialUnlimitedDays);
  const selectedPlan = plans[selectedIndex] ?? plans[0];
  const selectedDisplayPlan = planWithSelectedValidity(selectedPlan, unlimitedDays);
  const activationDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);

    return date.toLocaleDateString("en-US", { day: "numeric", month: "long" });
  }, []);

  const plannerHref = useMemo(() => {
    const params = new URLSearchParams({
      destination: destination.name,
      selectedData: selectedDisplayPlan.data,
      selectedValidity: selectedDisplayPlan.days
    });

    if (startDate) {
      params.set("startDate", startDate);
    }
    if (endDate) {
      params.set("endDate", endDate);
    }

    return `/trip/new?${params.toString()}`;
  }, [destination.name, endDate, selectedDisplayPlan.data, selectedDisplayPlan.days, startDate]);

  return (
    <section className="rounded-lg bg-white p-4 shadow-[0_24px_90px_-72px_rgba(15,23,42,0.5)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Get an eSIM data plan for {destination.name}
        </h2>
        <Link
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          href={plannerHref}
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan, index) => {
          const isSelected = selectedIndex === index;
          const displayPlan = planWithSelectedValidity(plan, unlimitedDays);

          return (
            <label
              className={`relative flex min-h-[170px] cursor-pointer flex-col rounded-lg border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_18px_60px_-48px_rgba(15,23,42,0.55)] ${
                isSelected ? "border-slate-950 ring-1 ring-slate-950" : "border-slate-200 hover:border-slate-400"
              }`}
              key={`${plan.data}-${plan.days}`}
            >
              {plan.bestChoice ? (
                <span className="absolute inset-x-0 top-0 rounded-t-lg bg-black py-2 text-center text-xs font-semibold text-white">
                  Best Choice
                </span>
              ) : null}
              <input
                checked={isSelected}
                className={`h-4 w-4 accent-black ${plan.bestChoice ? "mt-8" : ""}`}
                name="selectedPlan"
                onChange={() => setSelectedIndex(index)}
                type="radio"
              />
              <span className="mt-3 block text-lg font-semibold text-slate-950">{displayPlan.data}</span>
              {plan.validityOptions ? (
                <select
                  className="mt-3 h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                  onChange={(event) => {
                    setUnlimitedDays(Number(event.target.value));
                    setSelectedIndex(index);
                  }}
                  value={unlimitedDays}
                >
                  {plan.validityOptions.map((option) => (
                    <option key={option.dayCount} value={option.dayCount}>
                      {option.days}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="mt-3 block text-base text-slate-500">{displayPlan.days}</span>
              )}
              <span className="mt-4 block text-lg font-semibold text-slate-950">{displayPlan.price}</span>
              <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-[#fff4d6] px-3 py-1 text-[11px] font-medium text-slate-800">
                <BadgePercent className="h-3 w-3" />
                3% in Connecta credits
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 px-4 py-4 text-sm text-slate-950">
        <p className="text-center font-semibold">Can I activate my plan later?</p>
        <p className="mt-2 flex items-start justify-center gap-2 text-center leading-6">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            All plans have a 30-day activation period. If you get a plan today and do not activate it until{" "}
            {activationDate}, it will be activated automatically.
          </span>
        </p>
      </div>
    </section>
  );
}

function planWithSelectedValidity(plan: MarketingPlan, selectedDays: number) {
  const selectedOption = plan.validityOptions?.find((option) => option.dayCount === selectedDays);

  if (!selectedOption) {
    return plan;
  }

  return {
    ...plan,
    days: selectedOption.days,
    price: selectedOption.price
  };
}

function nearestUnlimitedValidity(plans: MarketingPlan[], tripDays?: number) {
  const options = plans.find((plan) => plan.validityOptions)?.validityOptions;

  if (!options?.length) {
    return 15;
  }

  if (!tripDays) {
    return options.find((option) => option.dayCount === 15)?.dayCount ?? options[0].dayCount;
  }

  return options.find((option) => option.dayCount >= tripDays)?.dayCount ?? options[options.length - 1].dayCount;
}

function tripLengthDays(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) {
    return undefined;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const difference = end.getTime() - start.getTime();

  if (!Number.isFinite(difference) || difference < 0) {
    return undefined;
  }

  return Math.floor(difference / 86_400_000) + 1;
}
