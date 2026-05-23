"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useState } from "react";
import { AlertCircle, ArrowRight, CalendarDays, Loader2, MapPin, SignalHigh } from "lucide-react";

import { AgentStepsTrace } from "@/components/AgentStepsTrace";
import { ConnectivityGuide } from "@/components/ConnectivityGuide";
import { PlanComparison } from "@/components/PlanComparison";
import { RecommendationCard } from "@/components/RecommendationCard";
import { UsageBreakdown } from "@/components/UsageBreakdown";
import {
  analyzeTrip,
  type TravelerType,
  type TripAnalysis,
  type TripInput,
  type UsageInput,
  type UsageLevel
} from "@/lib/graphql";
import { destinationOptions } from "@/lib/destination-catalog";
import { validateTripInput } from "@/lib/validations";

const usageLabels: Array<[keyof UsageInput, string]> = [
  ["maps", "Maps"],
  ["streaming", "Streaming"],
  ["socialMedia", "Social"],
  ["videoCalls", "Video calls"],
  ["hotspot", "Hotspot"],
  ["work", "Work"]
];

const usageLevels: UsageLevel[] = ["NONE", "LIGHT", "MODERATE", "HEAVY"];

const initialUsage: UsageInput = {
  maps: "MODERATE",
  streaming: "LIGHT",
  socialMedia: "MODERATE",
  videoCalls: "LIGHT",
  hotspot: "NONE",
  work: "LIGHT"
};

type TripFormProps = {
  initialDestination?: string;
  initialStartDate?: string;
  initialEndDate?: string;
};

export function TripForm({
  initialDestination = "Japan",
  initialStartDate = "2026-06-10",
  initialEndDate = "2026-06-17"
}: TripFormProps) {
  const [destination, setDestination] = useState(initialDestination);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [usage, setUsage] = useState<UsageInput>(initialUsage);
  const [analysis, setAnalysis] = useState<TripAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const input: TripInput = {
      destination,
      startDate,
      endDate,
      travelerType: inferTravelerType(usage),
      usage
    };

    try {
      validateTripInput(input);
      const result = await analyzeTrip(input);
      setAnalysis(result);
    } catch {
      setError("We could not find a plan right now. Please check your trip details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateUsage(key: keyof UsageInput) {
    return (event: ChangeEvent<HTMLSelectElement>) => {
      setUsage((current) => ({
        ...current,
        [key]: event.target.value as UsageLevel
      }));
    };
  }

  return (
    <div className="grid gap-8" id="planner">
      <section className="rounded-lg bg-[#e9f7f4] p-4 shadow-[0_26px_90px_-70px_rgba(15,23,42,0.5)] sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-700">Compact planner</p>
            <h2 className="mt-1 text-3xl font-semibold text-slate-950">Build your travel eSIM plan</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600">A few details are enough to compare plans and prepare your setup guide.</p>
        </div>

        <form className="grid gap-4 rounded-lg bg-white p-3 shadow-[0_22px_80px_-64px_rgba(15,23,42,0.55)]" onSubmit={handleSubmit}>
          <div className="grid gap-3 lg:grid-cols-[1.25fr_0.86fr_0.86fr_auto] lg:items-end">
            <Field icon={<MapPin className="h-4 w-4 text-teal-600" />} label="Destination">
              <input
                className={inputClassName}
                list="connecta-trip-destinations"
                minLength={2}
                onChange={(event) => setDestination(event.target.value)}
                required
                value={destination}
              />
              <datalist id="connecta-trip-destinations">
                {destinationOptions.map((option) => (
                  <option key={option.name} value={option.name} />
                ))}
              </datalist>
            </Field>

            <Field icon={<CalendarDays className="h-4 w-4 text-teal-600" />} label="Start date">
              <input
                className={inputClassName}
                onChange={(event) => setStartDate(event.target.value)}
                required
                type="date"
                value={startDate}
              />
            </Field>

            <Field icon={<CalendarDays className="h-4 w-4 text-teal-600" />} label="End date">
              <input
                className={inputClassName}
                onChange={(event) => setEndDate(event.target.value)}
                required
                type="date"
                value={endDate}
              />
            </Field>

            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Finding plan
                </>
              ) : (
                <>
                  Find my plan
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          <div className="rounded-lg bg-[#fbfaf7] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
              <SignalHigh className="h-4 w-4 text-teal-700" />
              How much data will you use?
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {usageLabels.map(([key, label]) => (
                <Field key={key} label={label}>
                  <select className={inputClassName} onChange={updateUsage(key)} value={usage[key]}>
                    {usageLevels.map((level) => (
                      <option key={level} value={level}>
                        {formatEnum(level)}
                      </option>
                    ))}
                  </select>
                </Field>
              ))}
            </div>
          </div>
        </form>
      </section>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-medium">Could not find a plan</div>
              <p className="mt-1 leading-6">{error}</p>
            </div>
          </div>
        </div>
      ) : null}

      {isSubmitting ? <LoadingState /> : null}

      {analysis ? (
        <div className="grid gap-5">
          <RecommendationCard analysis={analysis} />
          {analysis.connectivityGuide ? <ConnectivityGuide guide={analysis.connectivityGuide} /> : null}
          <PlanComparison selected={analysis.selectedPlan} alternatives={analysis.alternatives} />
          <UsageBreakdown breakdown={analysis.usageBreakdown} />
          <AgentStepsTrace steps={analysis.agentSteps} />
        </div>
      ) : null}
    </div>
  );
}

const inputClassName =
  "w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-50";

function Field({ children, icon, label }: { children: ReactNode; icon?: ReactNode; label: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

function LoadingState() {
  return (
    <section className="rounded-lg border border-teal-100 bg-teal-50 p-4 text-sm text-teal-800">
      <div className="flex items-center gap-3">
        <Loader2 className="h-4 w-4 animate-spin" />
        <div>
          <div className="font-medium">Finding your best plan</div>
          <p className="mt-1 text-teal-700">Checking your trip needs and preparing a simple recommendation.</p>
        </div>
      </div>
    </section>
  );
}

function inferTravelerType(usage: UsageInput): TravelerType {
  if (usage.work === "HEAVY" || usage.hotspot === "HEAVY" || usage.videoCalls === "HEAVY") {
    return "BUSINESS";
  }

  return "SOLO";
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
