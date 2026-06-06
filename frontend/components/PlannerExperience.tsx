"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Globe2, ShieldCheck, Smartphone } from "lucide-react";

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
  const [bestChoiceValidityDays, setBestChoiceValidityDays] = useState<number | undefined>(undefined);
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
    setBestChoiceData(nextAnalysis.selectedPlan.dataLabel ?? `${nextAnalysis.selectedPlan.dataGb} GB`);
    setBestChoiceValidityDays(nextAnalysis.selectedPlan.validityDays);
    setResultsMode(true);
  }

  function handleManualContinue(plan: MarketingPlan) {
    const manualPlan = toPlanOption(plan, selectedDestination.name, selectedDestination.kind);
    setBestChoiceData(plan.data);
    setBestChoiceValidityDays(parseDays(plan.days));
    router.push(checkoutHrefForPlan(manualPlan, selectedDestination.name));
  }

  const otherOption = analysis ? bestAlternativeForUsage(analysis.selectedPlan, analysis.alternatives) : null;

  return (
    <div
      className={`grid gap-10 lg:items-start ${resultsMode ? "" : "lg:grid-cols-[0.82fr_1.18fr]"}`}
      ref={resultsRef}
    >
      {!resultsMode ? (
        <aside className="pt-3 lg:sticky lg:top-8">
          <p className="text-sm font-semibold text-orange-700">Travel data, made simple</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.04] text-slate-950 sm:text-5xl">
            Find a plan that feels right before you land.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
            Tell us where you are going and what you need. We will keep the choices simple, clear, and ready before departure.
          </p>
          <div className="mt-10 grid gap-4">
            {plannerBenefits.map((benefit) => (
              <div className="grid grid-cols-[auto_1fr] gap-4 rounded-md bg-white/80 p-4 shadow-[0_14px_46px_-44px_rgba(15,23,42,0.36)] ring-1 ring-slate-200/60" key={benefit.title}>
                <span className="mt-1 grid h-11 w-11 place-items-center rounded-md bg-orange-50 text-orange-700">
                  {benefit.icon}
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-950">{benefit.title}</h2>
                  <p className="mt-1.5 text-sm leading-6 text-slate-500">{benefit.text}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      ) : null}

      <div className="min-w-0">
        <div className={resultsMode && analysis ? "grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-start" : "grid gap-10"}>
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
              manualChoiceHref="#choose-yourself"
            />
          ) : null}
        </div>

        {resultsMode && analysis ? (
          <div className="mt-7 grid gap-7">
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

        <div className={`${resultsMode && analysis ? "mt-6" : "mt-12"} scroll-mt-6`} id="choose-yourself">
          <CountryPlanSelector
            bestChoiceData={bestChoiceData}
            bestChoiceValidityDays={bestChoiceValidityDays}
            destination={selectedDestination}
            endDate={tripDetails.endDate}
            onContinue={handleManualContinue}
            plans={plans}
            startDate={tripDetails.startDate}
            title={`Choose your own ${selectedDestination.name} eSIM`}
          />
        </div>
      </div>
    </div>
  );
}

const plannerBenefits = [
  {
    icon: <Smartphone className="h-5 w-5" />,
    title: "Setup before departure",
    text: "Install your eSIM while you still have Wi-Fi at home."
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Avoid roaming surprises",
    text: "See data, validity, and total price before you choose."
  },
  {
    icon: <CheckCircle2 className="h-5 w-5" />,
    title: "Compare plans clearly",
    text: "Start with a clear match, then compare more plans when you want options."
  },
  {
    icon: <Globe2 className="h-5 w-5" />,
    title: "Works in your destination",
    text: "Plan around one country, a region, or a global trip."
  }
];

type ManualPlanOption = PlanOption & {
  dataLabel?: string;
};

function toPlanOption(plan: MarketingPlan, destination: string, kind: DestinationKind): ManualPlanOption {
  const dataGb = parseDataGb(plan.data);
  const displayData = displayDataLabel(plan.data, dataGb);

  return {
    id: `${destination.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${displayData.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${parseDays(plan.days)}`,
    provider: providerForDestination(kind),
    name: `${destination} ${displayData}`,
    priceUsd: parseUsd(plan.price),
    dataGb: dataGb ?? 50,
    dataLabel: plan.data,
    validityDays: parseDays(plan.days),
    tradeoff: "A practical mix of data, validity, and price for this trip."
  };
}

function displayDataLabel(data: string, dataGb: number | null) {
  if (dataGb !== null) {
    return `${dataGb}GB`;
  }

  return data.trim();
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
