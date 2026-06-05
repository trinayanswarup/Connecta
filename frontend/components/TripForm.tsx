"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, CalendarDays, Loader2, MapPin, SignalHigh } from "lucide-react";

import { AgentStepsTrace } from "@/components/AgentStepsTrace";
import { ConnectivityGuide } from "@/components/ConnectivityGuide";
import { bestAlternativeForUsage, PlanComparison } from "@/components/PlanComparison";
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
import { destinationOptions, plansForDestination, type DestinationKind, type MarketingPlan } from "@/lib/destination-catalog";
import { checkoutHrefForPlan } from "@/lib/checkout";
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
  compact?: boolean;
  initialDestination?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  onAnalysisReady?: (analysis: TripAnalysis) => void;
  onTripDetailsChange?: (details: { destination: string; startDate: string; endDate: string }) => void;
  showResults?: boolean;
};

export function TripForm({
  compact = false,
  initialDestination = "Japan",
  initialStartDate = "2026-06-10",
  initialEndDate = "2026-06-17",
  onAnalysisReady,
  onTripDetailsChange,
  showResults = true
}: TripFormProps) {
  const [destination, setDestination] = useState(initialDestination);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [usage, setUsage] = useState<UsageInput>(initialUsage);
  const [analysis, setAnalysis] = useState<TripAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!analysis) {
      return;
    }

    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [analysis]);

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
      const scopedResult = scopeAnalysisToDestination(result, input);
      setAnalysis(scopedResult);
      onAnalysisReady?.(scopedResult);
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

  function updateTripDetails(nextDetails: { destination?: string; startDate?: string; endDate?: string }) {
    const updatedDetails = {
      destination: nextDetails.destination ?? destination,
      startDate: nextDetails.startDate ?? startDate,
      endDate: nextDetails.endDate ?? endDate
    };

    onTripDetailsChange?.(updatedDetails);
  }

  return (
    <div className="grid gap-8" id="planner">
      <section
        className={`relative overflow-hidden rounded-[1.75rem] ${
          compact
            ? "bg-white p-5 shadow-[0_18px_70px_-58px_rgba(15,23,42,0.55)] ring-1 ring-slate-200/80 sm:p-6"
            : "bg-white p-6 shadow-[0_28px_100px_-78px_rgba(15,23,42,0.55)] sm:p-8"
        }`}
      >
        <div
          className="relative"
        >
          <div className="mb-8">
            <div>
              <p className="text-sm font-semibold text-orange-700">Find my plan</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight text-slate-950">Build your travel eSIM plan</h2>
              {!compact ? (
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  A few details help us compare data, price, validity, and destination fit.
                </p>
              ) : null}
            </div>
          </div>

          <form className="grid gap-7" onSubmit={handleSubmit}>
            <div className="grid gap-4 lg:grid-cols-[1.16fr_1.64fr]">
              <Field icon={<MapPin className="h-4 w-4 text-orange-600" />} label="Where are you traveling?">
                <input
                  className={inputClassName}
                  list="connecta-trip-destinations"
                  minLength={2}
                  onChange={(event) => {
                    setDestination(event.target.value);
                    updateTripDetails({ destination: event.target.value });
                  }}
                  required
                  value={destination}
                />
                <datalist id="connecta-trip-destinations">
                  {destinationOptions.map((option) => (
                    <option key={option.name} value={option.name} />
                  ))}
                </datalist>
              </Field>

              <div className="grid gap-2.5">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <CalendarDays className="h-4 w-4 text-orange-600" />
                  When is your trip?
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    aria-label="Trip start date"
                    className={inputClassName}
                    onChange={(event) => {
                      setStartDate(event.target.value);
                      updateTripDetails({ startDate: event.target.value });
                    }}
                    required
                    type="date"
                    value={startDate}
                  />
                  <input
                    aria-label="Trip return date"
                    className={inputClassName}
                    onChange={(event) => {
                      setEndDate(event.target.value);
                      updateTripDetails({ endDate: event.target.value });
                    }}
                    required
                    type="date"
                    value={endDate}
                  />
                </div>
              </div>
            </div>

            {!compact ? (
              <div className="rounded-[1.25rem] bg-[#fbfaf7] p-5 ring-1 ring-slate-100 sm:p-6">
                <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <SignalHigh className="h-4 w-4 text-orange-700" />
                  How will you use data?
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            ) : null}

            <button
              className="inline-flex h-14 cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-base font-semibold text-white shadow-[0_18px_54px_-36px_rgba(15,23,42,0.72)] transition-colors duration-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
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
          </form>
        </div>
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

      {showResults && analysis ? (
        <div className="grid gap-5 scroll-mt-6" ref={resultsRef}>
          <RecommendationCard
            analysis={analysis}
            checkoutHref={checkoutHrefForPlan(analysis.selectedPlan, destination)}
          />
          <PlanComparison
            alternatives={analysis.alternatives}
            checkoutHref={checkoutHrefForPlan(bestAlternativeForUsage(analysis.selectedPlan, analysis.alternatives), destination)}
            selected={analysis.selectedPlan}
          />
          <UsageBreakdown breakdown={analysis.usageBreakdown} />
          {analysis.connectivityGuide ? <ConnectivityGuide guide={analysis.connectivityGuide} /> : null}
          <AgentStepsTrace steps={analysis.agentSteps} />
        </div>
      ) : null}
    </div>
  );
}

const inputClassName =
  "w-full min-w-0 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-50";

function Field({ children, icon, label }: { children: ReactNode; icon?: ReactNode; label: string }) {
  return (
    <label className="grid gap-2.5 text-sm font-medium text-slate-700">
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
    <section className="rounded-lg border border-orange-100 bg-orange-50 p-4 text-sm text-orange-800">
      <div className="flex items-center gap-3">
        <Loader2 className="h-4 w-4 animate-spin" />
        <div>
          <div className="font-medium">Finding your best plan</div>
          <p className="mt-1 text-orange-700">Checking your trip needs and preparing a simple recommendation.</p>
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

function scopeAnalysisToDestination(analysis: TripAnalysis, input: TripInput): TripAnalysis {
  const destination = input.destination;
  const scopedPlans = finitePlansForDestination(destination);
  const estimate = estimateUsageForInput(input);

  if (scopedPlans.length === 0) {
    return {
      ...analysis,
      estimatedGb: estimate.estimatedGb,
      recommendedGb: estimate.recommendedGb,
      confidence: estimate.confidence,
      usageBreakdown: estimate.usageBreakdown
    };
  }

  const destinationOption = destinationOptions.find(
    (option) => option.name.toLowerCase() === destination.trim().toLowerCase()
  );
  const destinationName = destinationOption?.name ?? destination.trim();
  const selectedPlan = bestPlanForRecommendation(scopedPlans, estimate.recommendedGb);
  const alternatives = scopedPlans
    .filter((plan) => plan.id !== selectedPlan.id)
    .sort((first, second) => Math.abs(first.dataGb - estimate.recommendedGb) - Math.abs(second.dataGb - estimate.recommendedGb))
    .slice(0, 3);

  return {
    ...analysis,
    estimatedGb: estimate.estimatedGb,
    recommendedGb: estimate.recommendedGb,
    confidence: estimate.confidence,
    usageBreakdown: estimate.usageBreakdown,
    selectedPlan,
    alternatives,
    recommendation: `${selectedPlan.name} is the best fit for this trip: it covers the ${Math.round(
      estimate.recommendedGb
    )} GB recommended allowance with ${Math.round(selectedPlan.dataGb)} GB available for ${destinationName}.`
  };
}

function estimateUsageForInput(input: TripInput) {
  const days = tripDays(input.startDate, input.endDate);
  const travelerMultiplier = multiplierForTraveler(input.travelerType);
  const businessMultiplier = input.travelerType === "BUSINESS" ? 1.25 : 1;

  const usageBreakdown = {
    maps: round1(dailyGb(input.usage.maps, 0.1, 0.25, 0.45) * days * travelerMultiplier),
    streaming: round1(dailyGb(input.usage.streaming, 0.2, 0.9, 2.2) * days * travelerMultiplier),
    socialMedia: round1(dailyGb(input.usage.socialMedia, 0.2, 0.7, 1.5) * days * travelerMultiplier),
    videoCalls: round1(dailyGb(input.usage.videoCalls, 0.25, 1.1, 2.5) * days * travelerMultiplier * businessMultiplier),
    hotspot: round1(dailyGb(input.usage.hotspot, 0.2, 1, 2.7) * days * travelerMultiplier),
    work: round1(dailyGb(input.usage.work, 0.25, 0.8, 1.8) * days * travelerMultiplier * businessMultiplier)
  };
  const estimatedGb = round1(Object.values(usageBreakdown).reduce((sum, value) => sum + value, 0));
  const recommendedGb = Math.ceil(estimatedGb * safetyMargin(input.travelerType, days));

  return {
    estimatedGb,
    recommendedGb,
    confidence: confidenceForInput(input, days),
    usageBreakdown
  };
}

function tripDays(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const days = Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1;

  return Number.isFinite(days) && days > 0 ? days : 1;
}

function dailyGb(level: UsageLevel, light: number, moderate: number, heavy: number) {
  if (level === "NONE") {
    return 0;
  }
  if (level === "LIGHT") {
    return light;
  }
  if (level === "HEAVY") {
    return heavy;
  }

  return moderate;
}

function multiplierForTraveler(travelerType: TravelerType) {
  if (travelerType === "COUPLE") {
    return 1.55;
  }
  if (travelerType === "FAMILY") {
    return 2.35;
  }
  if (travelerType === "BUSINESS") {
    return 1.15;
  }

  return 1;
}

function safetyMargin(travelerType: TravelerType, days: number) {
  let margin = 1.18;

  if (days >= 10) {
    margin += 0.07;
  }
  if (travelerType === "BUSINESS") {
    margin += 0.05;
  }

  return margin;
}

function confidenceForInput(input: TripInput, days: number) {
  let score = 0.86;

  if (days > 14) {
    score -= 0.05;
  }
  if (input.usage.hotspot === "HEAVY" || input.usage.videoCalls === "HEAVY") {
    score -= 0.04;
  }

  return round2(Math.max(score, 0.72));
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function finitePlansForDestination(destination: string) {
  const destinationOption = destinationOptions.find(
    (option) => option.name.toLowerCase() === destination.trim().toLowerCase()
  );
  const destinationName = destinationOption?.name ?? destination.trim();
  const provider = providerForDestination(destinationOption?.kind);

  return plansForDestination(destinationName)
    .map((plan) => toPlanOption(plan, destinationName, provider))
    .filter((plan): plan is PlanOptionFromMarketing => plan !== null)
    .sort((first, second) => first.dataGb - second.dataGb);
}

type PlanOptionFromMarketing = TripAnalysis["selectedPlan"];

function toPlanOption(plan: MarketingPlan, destination: string, provider: string): PlanOptionFromMarketing | null {
  const dataGb = parseDataGb(plan.data);

  if (dataGb === null) {
    return null;
  }

  return {
    id: `${destination.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${dataGb}gb`,
    provider,
    name: `${destination} ${dataGb}GB`,
    priceUsd: parseUsd(plan.price),
    dataGb,
    validityDays: parseDays(plan.days),
    tradeoff: "Best balance of price and safety margin."
  };
}

function bestPlanForRecommendation(plans: PlanOptionFromMarketing[], recommendedGb: number) {
  return plans.find((plan) => plan.dataGb >= recommendedGb) ?? plans[plans.length - 1];
}

function providerForDestination(kind?: DestinationKind) {
  if (kind === "global") {
    return "Connecta Global";
  }
  if (kind === "regional") {
    return "Connecta Regional";
  }

  return "Connecta Local";
}

function parseDataGb(value: string) {
  const match = value.match(/^(\d+(?:\.\d+)?)\s*GB$/i);

  return match ? Number(match[1]) : null;
}

function parseDays(value: string) {
  const match = value.match(/^(\d+)/);

  return match ? Number(match[1]) : 30;
}

function parseUsd(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));

  return Number.isFinite(parsed) ? parsed : 0;
}

