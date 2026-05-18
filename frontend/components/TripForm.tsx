"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";

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
const travelerTypes: TravelerType[] = ["SOLO", "COUPLE", "FAMILY", "BUSINESS"];

const initialUsage: UsageInput = {
  maps: "MODERATE",
  streaming: "LIGHT",
  socialMedia: "MODERATE",
  videoCalls: "LIGHT",
  hotspot: "NONE",
  work: "LIGHT"
};

export function TripForm() {
  const [destination, setDestination] = useState("Japan");
  const [startDate, setStartDate] = useState("2026-06-10");
  const [endDate, setEndDate] = useState("2026-06-17");
  const [travelerType, setTravelerType] = useState<TravelerType>("SOLO");
  const [budgetUsd, setBudgetUsd] = useState("");
  const [usage, setUsage] = useState<UsageInput>(initialUsage);
  const [analysis, setAnalysis] = useState<TripAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const parsedBudget = budgetUsd.trim() === "" ? undefined : Number(budgetUsd);
    const input: TripInput = {
      destination,
      startDate,
      endDate,
      travelerType,
      ...(parsedBudget === undefined ? {} : { budgetUsd: parsedBudget }),
      usage
    };

    try {
      validateTripInput(input);
      const result = await analyzeTrip(input);
      setAnalysis(result);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Trip analysis failed");
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
    <div className="mt-6 grid gap-6">
      <form className="rounded-lg border border-border bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Destination
            <input
              className="rounded-md border border-border px-3 py-2 font-normal"
              minLength={2}
              onChange={(event) => setDestination(event.target.value)}
              required
              value={destination}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Traveler type
            <select
              className="rounded-md border border-border px-3 py-2 font-normal"
              onChange={(event) => setTravelerType(event.target.value as TravelerType)}
              value={travelerType}
            >
              {travelerTypes.map((type) => (
                <option key={type} value={type}>
                  {formatEnum(type)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Start date
            <input
              className="rounded-md border border-border px-3 py-2 font-normal"
              onChange={(event) => setStartDate(event.target.value)}
              required
              type="date"
              value={startDate}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            End date
            <input
              className="rounded-md border border-border px-3 py-2 font-normal"
              onChange={(event) => setEndDate(event.target.value)}
              required
              type="date"
              value={endDate}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            Budget USD
            <input
              className="rounded-md border border-border px-3 py-2 font-normal"
              min={1}
              onChange={(event) => setBudgetUsd(event.target.value)}
              placeholder="Optional"
              step="1"
              type="number"
              value={budgetUsd}
            />
          </label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {usageLabels.map(([key, label]) => (
            <label key={key} className="grid gap-2 text-sm font-medium">
              {label}
              <select
                className="rounded-md border border-border px-3 py-2 font-normal"
                onChange={updateUsage(key)}
                value={usage[key]}
              >
                {usageLevels.map((level) => (
                  <option key={level} value={level}>
                    {formatEnum(level)}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <button
          className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Analyzing..." : "Analyze trip"}
        </button>
      </form>

      {analysis ? (
        <div className="grid gap-6">
          <RecommendationCard analysis={analysis} />
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <UsageBreakdown breakdown={analysis.usageBreakdown} />
            <PlanComparison selected={analysis.selectedPlan} alternatives={analysis.alternatives} />
          </div>
          {analysis.connectivityGuide ? (
            <ConnectivityGuide guide={analysis.connectivityGuide} />
          ) : null}
          <AgentStepsTrace steps={analysis.agentSteps} />
        </div>
      ) : null}
    </div>
  );
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
