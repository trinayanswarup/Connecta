"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { AgentStepsTrace } from "@/components/AgentStepsTrace";
import { ConnectivityGuide } from "@/components/ConnectivityGuide";
import { CountryPlanSelector } from "@/components/CountryPlanSelector";
import { bestAlternativeForUsage, PlanComparison } from "@/components/PlanComparison";
import { RecommendationCard } from "@/components/RecommendationCard";
import { TripForm } from "@/components/TripForm";
import { UsageBreakdown } from "@/components/UsageBreakdown";
import { destinationOptions, plansForDestination, type DestinationKind, type MarketingPlan } from "@/lib/destination-catalog";
import { checkoutHrefForPlan } from "@/lib/checkout";
import type { PlanOption, TripAnalysis } from "@/lib/graphql";

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
  const router = useRouter();
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    destination: initialDestination,
    startDate: initialStartDate,
    endDate: initialEndDate
  });
  const [analysis, setAnalysis] = useState<TripAnalysis | null>(null);
  const [bestChoiceData, setBestChoiceData] = useState<string | undefined>(undefined);
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
    setBestChoiceData(`${nextAnalysis.selectedPlan.dataGb} GB`);
    setResultsMode(true);
  }

  function handleManualContinue(plan: MarketingPlan) {
    const manualPlan = toPlanOption(plan, selectedDestination.name, selectedDestination.kind);
    setBestChoiceData(plan.data);
    router.push(checkoutHrefForPlan(manualPlan, selectedDestination.name));
  }

  const otherOption = analysis ? bestAlternativeForUsage(analysis.selectedPlan, analysis.alternatives) : null;

  return (
    <div
      className={`grid gap-10 lg:items-start ${resultsMode ? "" : "lg:grid-cols-[0.68fr_1.32fr]"}`}
      ref={resultsRef}
    >
      {!resultsMode ? (
        <aside className="lg:sticky lg:top-8">
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
      ) : null}

      <div className="min-w-0">
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

          {resultsMode && analysis ? (
            <RecommendationCard
              analysis={analysis}
              checkoutHref={checkoutHrefForPlan(analysis.selectedPlan, selectedDestination.name)}
            />
          ) : null}
        </div>

        {resultsMode && analysis ? (
          <div className="mt-5 grid gap-5 transition-all duration-700 ease-out">
            <PlanComparison
              alternatives={analysis.alternatives}
              checkoutHref={otherOption ? checkoutHrefForPlan(otherOption, selectedDestination.name) : undefined}
              selected={analysis.selectedPlan}
            />
            <UsageBreakdown breakdown={analysis.usageBreakdown} />
            {analysis.connectivityGuide ? <ConnectivityGuide guide={analysis.connectivityGuide} /> : null}
            <AgentStepsTrace steps={analysis.agentSteps} />
          </div>
        ) : null}

        <div className={resultsMode && analysis ? "mt-5" : "mt-10"}>
          <CountryPlanSelector
            bestChoiceData={bestChoiceData}
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
