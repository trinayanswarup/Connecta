"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import { AgentStepsTrace } from "@/components/AgentStepsTrace";
import { ConnectivityGuide } from "@/components/ConnectivityGuide";
import { CountryPlanSelector } from "@/components/CountryPlanSelector";
import { PlanComparison } from "@/components/PlanComparison";
import { RecommendationCard } from "@/components/RecommendationCard";
import { TripForm } from "@/components/TripForm";
import { UsageBreakdown } from "@/components/UsageBreakdown";
import { destinationOptions, plansForDestination, type DestinationKind, type MarketingPlan } from "@/lib/destination-catalog";
import type { AgentStep, ConnectivityGuideResult, PlanOption, TripAnalysis, UsageBreakdownResult } from "@/lib/graphql";

type PlannerExperienceProps = {
  initialDestination?: string;
  initialStartDate?: string;
  initialEndDate?: string;
};

type TripDetails = {
  destination: string;
  startDate: string;
  endDate: string;
};

export function PlannerExperience({
  initialDestination = "Japan",
  initialStartDate = "2026-06-10",
  initialEndDate = "2026-06-17"
}: PlannerExperienceProps) {
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    destination: initialDestination,
    startDate: initialStartDate,
    endDate: initialEndDate
  });
  const [analysis, setAnalysis] = useState<TripAnalysis | null>(null);
  const [resultsMode, setResultsMode] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const selectedDestination = useMemo(() => {
    const normalizedDestination = tripDetails.destination.trim().toLowerCase();

    return (
      destinationOptions.find((destination) => destination.name.toLowerCase() === normalizedDestination) ??
      destinationOptions.find((destination) => destination.name === initialDestination) ??
      destinationOptions.find((destination) => destination.name === "Japan") ??
      destinationOptions[0]
    );
  }, [initialDestination, tripDetails.destination]);

  const plans = useMemo(() => plansForDestination(selectedDestination.name), [selectedDestination.name]);

  useEffect(() => {
    if (!resultsMode) {
      return;
    }

    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [resultsMode, analysis]);

  function handleAnalysisReady(nextAnalysis: TripAnalysis) {
    setAnalysis(nextAnalysis);
    setResultsMode(true);
  }

  function handleManualContinue(plan: MarketingPlan) {
    setAnalysis(createManualAnalysis(plan, plans, selectedDestination.name, selectedDestination.kind));
    setResultsMode(true);
  }

  return (
    <div
      className={`grid gap-10 transition-all duration-700 ease-out lg:items-start ${
        resultsMode ? "lg:grid-cols-[0fr_1fr]" : "lg:grid-cols-[0.68fr_1.32fr]"
      }`}
      ref={resultsRef}
    >
      <aside
        className={`overflow-hidden transition-all duration-700 ease-out lg:sticky lg:top-8 ${
          resultsMode ? "max-h-0 -translate-x-4 opacity-0 lg:max-w-0" : "max-h-[52rem] translate-x-0 opacity-100"
        }`}
      >
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
      </aside>

      <div className="min-w-0 transition-all duration-700 ease-out">
        <div className={resultsMode && analysis ? "grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start" : "grid gap-10"}>
          <TripForm
            compact={resultsMode}
            initialDestination={initialDestination}
            initialEndDate={initialEndDate}
            initialStartDate={initialStartDate}
            onAnalysisReady={handleAnalysisReady}
            onTripDetailsChange={setTripDetails}
            showResults={false}
          />

          {resultsMode && analysis ? <RecommendationCard analysis={analysis} /> : null}
        </div>

        {resultsMode && analysis ? (
          <div className="mt-5 grid gap-5 transition-all duration-700 ease-out">
            <PlanComparison selected={analysis.selectedPlan} alternatives={analysis.alternatives} />
            <UsageBreakdown breakdown={analysis.usageBreakdown} />
            {analysis.connectivityGuide ? <ConnectivityGuide guide={analysis.connectivityGuide} /> : null}
            <AgentStepsTrace steps={analysis.agentSteps} />
          </div>
        ) : null}

        <div className={resultsMode && analysis ? "mt-5" : "mt-10"}>
          <CountryPlanSelector
            destination={selectedDestination}
            endDate={tripDetails.endDate}
            onContinue={handleManualContinue}
            plans={plans}
            startDate={tripDetails.startDate}
            title={`Choose it yourself: ${selectedDestination.name} eSIM`}
          />
        </div>
      </div>
    </div>
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

function createManualAnalysis(plan: MarketingPlan, plans: MarketingPlan[], destination: string, kind: DestinationKind): TripAnalysis {
  const selectedPlan = toPlanOption(plan, destination, kind);
  const alternatives = plans
    .map((candidate) => toPlanOption(candidate, destination, kind))
    .filter((candidate) => candidate.id !== selectedPlan.id)
    .sort((first, second) => Math.abs(first.dataGb - selectedPlan.dataGb) - Math.abs(second.dataGb - selectedPlan.dataGb))
    .slice(0, 3);

  return {
    tripId: "manual-selection",
    agentRunId: "manual-selection",
    estimatedGb: Math.min(selectedPlan.dataGb, 12),
    recommendedGb: selectedPlan.dataGb,
    confidence: 1,
    usageBreakdown: defaultBreakdown(selectedPlan.dataGb),
    selectedPlan,
    recommendation: `${selectedPlan.name} is selected for this trip, with ${selectedPlan.dataGb} GB available for ${destination}.`,
    alternatives,
    connectivityGuide: defaultConnectivityGuide,
    agentSteps: manualSteps
  };
}

function toPlanOption(plan: MarketingPlan, destination: string, kind: DestinationKind): PlanOption {
  const dataGb = parseDataGb(plan.data) ?? 50;

  return {
    id: `${destination.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${dataGb}gb-${parseDays(plan.days)}`,
    provider: providerForDestination(kind),
    name: `${destination} ${dataGb}GB`,
    priceUsd: parseUsd(plan.price),
    dataGb,
    validityDays: parseDays(plan.days),
    tradeoff: "Best balance of price and safety margin."
  };
}

function providerForDestination(kind: DestinationKind) {
  if (kind === "global") {
    return "Connecta Global";
  }
  if (kind === "regional") {
    return "Connecta Regional";
  }

  return "Connecta Local";
}

function defaultBreakdown(dataGb: number): UsageBreakdownResult {
  return {
    maps: round1(dataGb * 0.18),
    streaming: round1(dataGb * 0.28),
    socialMedia: round1(dataGb * 0.22),
    videoCalls: round1(dataGb * 0.14),
    hotspot: round1(dataGb * 0.08),
    work: round1(dataGb * 0.1)
  };
}

const defaultConnectivityGuide: ConnectivityGuideResult = {
  beforeDeparture: ["Install the eSIM app before leaving and keep your primary SIM active for account verification."],
  airportSetup: ["Turn on the travel data plan after landing and run a quick connectivity check."],
  offlineStrategy: ["Save maps, hotel details, and tickets offline before departure."],
  backupInternet: ["Keep airport Wi-Fi and hotel Wi-Fi as fallback options."],
  emergencyAccess: ["Keep roaming disabled until needed, then enable it only for emergency access."]
};

const manualSteps: AgentStep[] = [
  {
    name: "Plan optimization",
    status: "COMPLETED",
    durationMs: 1,
    inputSummary: "Manual plan selection",
    outputSummary: "Selected plan shown with nearby alternatives",
    retries: 0
  }
];

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

function round1(value: number) {
  return Math.round(value * 10) / 10;
}
