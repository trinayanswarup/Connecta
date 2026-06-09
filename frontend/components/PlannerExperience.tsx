"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Globe2, ShieldCheck, Smartphone } from "lucide-react";

const U = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

// Only confirmed-working IDs are used below (all 20 from the original tested set)
// Countries without a unique photo are mapped to the closest visual archetype
const _MED  = "photo-1533105079780-92b9be482077"; // Santorini — Mediterranean coast
const _MTN  = "photo-1506905925346-21bda4d32df4"; // dramatic mountain fjord
const _CITY = "photo-1467269204594-9661b134dd2b"; // European city / Berlin
const _NETH = "photo-1534351590666-13e3e96b5017"; // Netherlands canals
const _NORD = "photo-1519832979-6fa011b87667";    // mountain lake — Nordic feel
const _DSRT = "photo-1541432901042-2d8bd64b4a9b"; // Cappadocia — desert/ancient ruins
const _BALI = "photo-1537996194471-e657df975ab4"; // Bali tropical temples
const _SGAP = "photo-1525625293386-3f8f99389edd"; // Singapore skyline
const _TAJ  = "photo-1564507592333-c60657eea523"; // Taj Mahal — South Asia
const _JPN  = "photo-1493976040374-85c8e12f0c0e"; // Japan landscape
const _BEACH= "photo-1507525428034-b723cf961d3e"; // turquoise tropical beach
const _RIO  = "photo-1483729558449-99ef09a8c325"; // Rio de Janeiro — South America
const _MAYA = "photo-1518105779142-d975f22f1b0a"; // Mayan ruins — Latin America
const _LISB = "photo-1555881400-74d7acaacd8b";    // Lisbon — Iberian/coastal

const destinationImages: Record<string, string> = {
  // ── Regional plans ──────────────────────────────────────────────────────
  "Global":        U("photo-1451187580459-43490279c0fa"),
  "Africa":        U(_BALI),
  "Asia":          U(_JPN),
  "Europe":        U(_MED),
  "North America": U("photo-1501594907352-04cda38ebc29"),
  "South America": U(_RIO),
  "Oceania":       U(_MTN),
  "Middle East":   U(_DSRT),
  "Caribbean":     U(_BEACH),

  // ── Europe ──────────────────────────────────────────────────────────────
  // confirmed specific photos
  "France":         U("photo-1502602898657-3e91760cbb34"),
  "Germany":        U(_CITY),
  "Greece":         U(_MED),
  "Italy":          U("photo-1523906834658-6e24ef2386f9"),
  "Netherlands":    U(_NETH),
  "Portugal":       U(_LISB),
  "Spain":          U("photo-1539037116277-4db20889f2d4"),
  "Turkey":         U(_DSRT),
  "United Kingdom": U("photo-1513635269975-59663e0ac1ad"),
  // Mediterranean coast → Santorini vibes
  "Albania":                  U(_MED),
  "Bosnia and Herzegovina":   U(_MED),
  "Croatia":                  U(_MED),
  "Cyprus":                   U(_MED),
  "Malta":                    U(_MED),
  "Montenegro":               U(_MED),
  "North Macedonia":          U(_MED),
  // Iberian / southern European
  "Andorra":        U("photo-1539037116277-4db20889f2d4"),
  "San Marino":     U("photo-1523906834658-6e24ef2386f9"),
  "Vatican City":   U("photo-1523906834658-6e24ef2386f9"),
  // Alpine — dramatic mountains
  "Austria":        U(_MTN),
  "Iceland":        U(_MTN),
  "Liechtenstein":  U(_MTN),
  "Norway":         U(_MTN),
  "Slovakia":       U(_MTN),
  "Slovenia":       U(_MTN),
  "Switzerland":    U(_MTN),
  // Nordic / lake landscapes
  "Denmark":        U(_NORD),
  "Estonia":        U(_NORD),
  "Finland":        U(_NORD),
  "Ireland":        U(_NORD),
  "Latvia":         U(_NORD),
  "Lithuania":      U(_NORD),
  "Sweden":         U(_NORD),
  // Western European cities
  "Belgium":        U(_NETH),
  "Luxembourg":     U(_NETH),
  "Monaco":         U("photo-1502602898657-3e91760cbb34"),
  // Central / Eastern European cities
  "Belarus":        U(_CITY),
  "Bulgaria":       U(_CITY),
  "Czech Republic": U(_CITY),
  "Georgia":        U(_DSRT),
  "Hungary":        U(_CITY),
  "Kosovo":         U(_CITY),
  "Moldova":        U(_CITY),
  "Poland":         U(_CITY),
  "Romania":        U(_CITY),
  "Russia":         U(_CITY),
  "Serbia":         U(_CITY),
  "Ukraine":        U(_CITY),

  // ── Asia ────────────────────────────────────────────────────────────────
  // confirmed specific photos
  "India":       U(_TAJ),
  "Indonesia":   U(_BALI),
  "Japan":       U(_JPN),
  "Singapore":   U(_SGAP),
  "South Korea": U("photo-1517154421773-0529f29ea451"),
  "Thailand":    U(_BEACH),
  // East Asian
  "China":       U(_JPN),
  "Hong Kong":   U(_SGAP),
  "Macau":       U(_SGAP),
  "Mongolia":    U(_MTN),
  "North Korea": U(_JPN),
  "Taiwan":      U(_JPN),
  // SE Asia tropical temples / coast
  "Cambodia":    U(_BALI),
  "Laos":        U(_BALI),
  "Malaysia":    U(_SGAP),
  "Myanmar":     U(_BALI),
  "Philippines": U(_BEACH),
  "Timor-Leste": U(_BALI),
  "Vietnam":     U(_BALI),
  "Brunei":      U(_SGAP),
  // South Asia
  "Afghanistan": U(_MTN),
  "Bangladesh":  U(_TAJ),
  "Bhutan":      U(_MTN),
  "Maldives":    U(_BEACH),
  "Nepal":       U(_MTN),
  "Pakistan":    U(_MTN),
  "Sri Lanka":   U(_BEACH),
  // Central Asia / Caucasus
  "Armenia":     U(_DSRT),
  "Azerbaijan":  U(_DSRT),
  "Kazakhstan":  U(_MTN),
  "Kyrgyzstan":  U(_MTN),
  "Tajikistan":  U(_MTN),
  "Turkmenistan":U(_DSRT),
  "Uzbekistan":  U(_DSRT),
  // Middle East / Levant
  "Bahrain":      U(_DSRT),
  "Iran":         U(_DSRT),
  "Iraq":         U(_DSRT),
  "Israel":       U(_DSRT),
  "Jordan":       U(_DSRT),
  "Kuwait":       U(_DSRT),
  "Lebanon":      U(_MED),
  "Oman":         U(_DSRT),
  "Palestine":    U(_DSRT),
  "Qatar":        U(_DSRT),
  "Saudi Arabia": U(_DSRT),
  "Syria":        U(_DSRT),
  "United Arab Emirates": U(_DSRT),
  "Yemen":        U(_DSRT),

  // ── Africa ──────────────────────────────────────────────────────────────
  // North Africa / Saharan → desert & ancient architecture
  "Algeria":      U(_DSRT),
  "Chad":         U(_DSRT),
  "Djibouti":     U(_DSRT),
  "Egypt":        U(_DSRT),
  "Eritrea":      U(_DSRT),
  "Libya":        U(_DSRT),
  "Mali":         U(_DSRT),
  "Mauritania":   U(_DSRT),
  "Morocco":      U(_DSRT),
  "Niger":        U(_DSRT),
  "Somalia":      U(_DSRT),
  "Sudan":        U(_DSRT),
  "Tunisia":      U(_DSRT),
  // East / Central Africa → tropical greenery
  "Burundi":      U(_BALI),
  "Cameroon":     U(_BALI),
  "Central African Republic": U(_BALI),
  "Congo":        U(_BALI),
  "Democratic Republic of the Congo": U(_BALI),
  "Equatorial Guinea": U(_BALI),
  "Ethiopia":     U(_BALI),
  "Gabon":        U(_BALI),
  "Kenya":        U(_BALI),
  "Madagascar":   U(_BALI),
  "Malawi":       U(_BALI),
  "Rwanda":       U(_BALI),
  "South Sudan":  U(_BALI),
  "Tanzania":     U(_BALI),
  "Uganda":       U(_BALI),
  // West Africa → colourful coastal
  "Angola":       U(_RIO),
  "Benin":        U(_RIO),
  "Burkina Faso": U(_RIO),
  "Cote d'Ivoire":U(_RIO),
  "Gambia":       U(_RIO),
  "Ghana":        U(_RIO),
  "Guinea":       U(_RIO),
  "Guinea-Bissau":U(_RIO),
  "Liberia":      U(_RIO),
  "Nigeria":      U(_RIO),
  "Senegal":      U(_RIO),
  "Sierra Leone": U(_RIO),
  "Togo":         U(_RIO),
  // Southern Africa → dramatic landscape
  "Botswana":     U(_MTN),
  "Eswatini":     U(_MTN),
  "Lesotho":      U(_MTN),
  "Mozambique":   U(_BEACH),
  "Namibia":      U(_MTN),
  "South Africa": U(_MTN),
  "Zambia":       U(_MTN),
  "Zimbabwe":     U(_MTN),
  // Indian Ocean islands
  "Cape Verde":   U(_BEACH),
  "Comoros":      U(_BEACH),
  "Mauritius":    U(_BEACH),
  "Sao Tome and Principe": U(_BALI),
  "Seychelles":   U(_BEACH),

  // ── The Americas ────────────────────────────────────────────────────────
  // confirmed specific photos
  "Brazil":        U(_RIO),
  "Canada":        U(_NORD),
  "Mexico":        U(_MAYA),
  "United States": U("photo-1501594907352-04cda38ebc29"),
  // Central America
  "Belize":        U(_MAYA),
  "Costa Rica":    U(_BALI),
  "El Salvador":   U(_MAYA),
  "Guatemala":     U(_MAYA),
  "Honduras":      U(_MAYA),
  "Nicaragua":     U(_MAYA),
  "Panama":        U(_BALI),
  // South America
  "Argentina":     U(_MTN),
  "Bolivia":       U(_MTN),
  "Chile":         U(_MTN),
  "Colombia":      U(_RIO),
  "Ecuador":       U(_MTN),
  "Guyana":        U(_BALI),
  "Paraguay":      U(_RIO),
  "Peru":          U(_MAYA),
  "Suriname":      U(_BALI),
  "Uruguay":       U(_LISB),
  "Venezuela":     U(_MTN),
  // Caribbean
  "Antigua and Barbuda":               U(_BEACH),
  "Bahamas":                           U(_BEACH),
  "Barbados":                          U(_BEACH),
  "Cuba":                              U(_BEACH),
  "Dominica":                          U(_BALI),
  "Dominican Republic":                U(_BEACH),
  "Grenada":                           U(_BEACH),
  "Haiti":                             U(_BEACH),
  "Jamaica":                           U(_BEACH),
  "Puerto Rico":                       U(_BEACH),
  "Saint Kitts and Nevis":             U(_BEACH),
  "Saint Lucia":                       U(_BEACH),
  "Saint Vincent and the Grenadines":  U(_BEACH),
  "Trinidad and Tobago":               U(_BEACH),

  // ── Oceania ─────────────────────────────────────────────────────────────
  "Australia":        U(_MTN),
  "Fiji":             U(_BEACH),
  "Kiribati":         U(_BEACH),
  "Marshall Islands": U(_BEACH),
  "Micronesia":       U(_BEACH),
  "Nauru":            U(_BEACH),
  "New Zealand":      U(_MTN),
  "Palau":            U(_BEACH),
  "Papua New Guinea": U(_BALI),
  "Samoa":            U(_BEACH),
  "Solomon Islands":  U(_BEACH),
  "Tonga":            U(_BEACH),
  "Tuvalu":           U(_BEACH),
  "Vanuatu":          U(_BEACH),
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
    return "Connecta Local";
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
