"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Globe2, ShieldCheck, Smartphone } from "lucide-react";

const destinationImages: Record<string, string> = {
  Japan: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
  Italy: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900&q=80",
  Thailand: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  France: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
  Spain: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=80",
  "United States": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=900&q=80",
  "United Kingdom": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80",
  India: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80",
  Brazil: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=900&q=80",
  Australia: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
  Singapore: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80",
  Mexico: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=900&q=80",
  Canada: "https://images.unsplash.com/photo-1519832979-6fa011b87667?auto=format&fit=crop&w=900&q=80",
  Germany: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80",
  Netherlands: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=900&q=80",
  Greece: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80",
  Indonesia: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80",
  "South Korea": "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=900&q=80",
  Portugal: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80",
  Turkey: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=900&q=80",
};

function getDestinationImage(destination: string): string {
  return (
    destinationImages[destination] ??
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80"
  );
}

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
        <aside className="lg:sticky lg:top-8">
          <div className="group relative min-h-[540px] overflow-hidden rounded-2xl">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700"
              style={{ backgroundImage: `url(${getDestinationImage(tripDetails.destination)})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/40 to-slate-950/10" />
            <div className="absolute left-6 top-6">
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                Travel data, made simple
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-transparent p-7 backdrop-blur-sm transition-all duration-500 group-hover:bg-black/40">
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
                {tripDetails.destination}
              </h1>
              <p className="mt-2 text-sm text-white/75">Your eSIM, ready before you land.</p>
              <div className="mt-6 grid gap-3">
                {plannerBenefits.map((benefit) => (
                  <div className="flex items-center gap-3" key={benefit.title}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
                      {benefit.icon}
                    </span>
                    <span className="text-sm font-semibold text-white">{benefit.title}</span>
                  </div>
                ))}
              </div>
            </div>
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
