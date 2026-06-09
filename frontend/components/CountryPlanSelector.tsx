"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgePercent, Info } from "lucide-react";

import type { DestinationOption, MarketingPlan } from "@/lib/destination-catalog";

type CountryPlanSelectorProps = {
  bestChoiceData?: string;
  bestChoiceValidityDays?: number;
  destination: DestinationOption;
  onContinue?: (plan: MarketingPlan) => void;
  plans: MarketingPlan[];
  startDate?: string;
  endDate?: string;
  title?: string;
};

export function CountryPlanSelector({
  bestChoiceData,
  bestChoiceValidityDays,
  destination,
  onContinue,
  plans,
  startDate,
  endDate,
  title
}: CountryPlanSelectorProps) {
  const bestChoiceIndex = Math.max(
    0,
    plans.findIndex((plan) => matchesPlanData(plan.data, bestChoiceData)) >= 0
      ? plans.findIndex((plan) => matchesPlanData(plan.data, bestChoiceData))
      : plans.findIndex((plan) => plan.bestChoice)
  );
  const tripDays = tripLengthDays(startDate, endDate);
  const bestChoicePlan = plans[bestChoiceIndex];
  const initialUnlimitedDays =
    bestChoicePlan?.validityOptions && bestChoiceValidityDays
      ? bestChoiceValidityDays
      : nearestUnlimitedValidity(plans, tripDays);
  const [selectedIndex, setSelectedIndex] = useState(bestChoiceIndex);
  const [unlimitedDays, setUnlimitedDays] = useState(initialUnlimitedDays);
  const selectedPlan = plans[selectedIndex] ?? plans[0];
  const selectedDisplayPlan = planWithSelectedValidity(selectedPlan, unlimitedDays);
  const activationDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);

    return date.toLocaleDateString("en-US", { day: "numeric", month: "long" });
  }, []);

  useEffect(() => {
    setSelectedIndex(bestChoiceIndex);
    setUnlimitedDays(initialUnlimitedDays);
  }, [bestChoiceData, bestChoiceIndex, bestChoiceValidityDays, destination.name, initialUnlimitedDays]);

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
    <section className="rounded-lg bg-white p-5 shadow-[0_24px_82px_-74px_rgba(15,23,42,0.48)] ring-1 ring-slate-200/70 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-700">Available plans</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {title ?? `Get an eSIM data plan for ${destination.name}`}
          </h2>
        </div>
        {onContinue ? (
          <button
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_16px_46px_-32px_rgba(15,23,42,0.7)] transition-colors duration-200 hover:bg-slate-800"
            onClick={() => onContinue(selectedDisplayPlan)}
            type="button"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <Link
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_16px_46px_-32px_rgba(15,23,42,0.7)] transition-colors duration-200 hover:bg-slate-800"
            href={plannerHref}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan, index) => {
          const isSelected = selectedIndex === index;
          const isBestChoice = bestChoiceIndex === index;
          const displayPlan = planWithSelectedValidity(plan, unlimitedDays);

          return (
            <label
              className={`relative flex min-h-[176px] cursor-pointer flex-col rounded-md bg-white p-4 text-left shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_0_0_1px_rgba(251,146,60,0.38),0_16px_52px_-48px_rgba(15,23,42,0.42)] ${
                isSelected ? "bg-[#fffaf6] shadow-[inset_0_0_0_2px_rgba(234,88,12,0.8),0_20px_64px_-54px_rgba(15,23,42,0.52)]" : ""
              }`}
              key={`${plan.data}-${plan.days}`}
            >
              {isBestChoice ? (
                <span className="absolute right-4 top-4 rounded-md bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                  Best match
                </span>
              ) : null}
              <input
                checked={isSelected}
                className="h-4 w-4 accent-orange-700"
                name="selectedPlan"
                onChange={() => setSelectedIndex(index)}
                type="radio"
              />
              <span className="mt-4 block text-lg font-semibold text-slate-950">{displayPlan.data}</span>
              {plan.validityOptions ? (
                <select
                  className="mt-3 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
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
              <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-md bg-[#fff4d6] px-2.5 py-1 text-[11px] font-medium text-slate-700">
                <BadgePercent className="h-3 w-3" />
                3% in Connecta credits
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-5 rounded-md bg-slate-50 px-4 py-4 text-sm text-slate-950">
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

function matchesPlanData(planData: string, bestChoiceData?: string) {
  if (!bestChoiceData) {
    return false;
  }

  return planData.replace(/\s+/g, "").toLowerCase() === bestChoiceData.replace(/\s+/g, "").toLowerCase();
}

function nearestUnlimitedValidity(plans: MarketingPlan[], tripDays?: number) {
  const options = plans.find((plan) => plan.validityOptions)?.validityOptions;

  if (!options?.length) {
    return 15;
  }

  if (!tripDays) {
    return options[options.length - 1].dayCount;
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
