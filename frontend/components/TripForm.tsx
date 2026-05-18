"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { AlertTriangle, Loader2, MapPin, Plane, RadioTower, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
    <div className="grid gap-6">
      <form
        className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950/70 shadow-2xl shadow-emerald-950/20 backdrop-blur"
        onSubmit={handleSubmit}
      >
        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Plane className="h-4 w-4 text-emerald-200" />
                Trip intelligence
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                Inputs stay deterministic; AI only refines the reasoning and guide text.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-emerald-200">
              <RadioTower className="h-3.5 w-3.5" />
              Live GraphQL
            </span>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_0.72fr]">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              Destination
            <input
              className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2.5 font-normal text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-300/50 focus:bg-white/[0.07]"
              minLength={2}
              onChange={(event) => setDestination(event.target.value)}
              required
              value={destination}
            />
          </label>
            <label className="grid gap-2 text-sm font-medium text-zinc-200">
            Traveler type
            <select
              className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2.5 font-normal text-white outline-none transition focus:border-emerald-300/50"
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
            <label className="grid gap-2 text-sm font-medium text-zinc-200">
            Start date
            <input
              className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2.5 font-normal text-white outline-none transition focus:border-emerald-300/50 focus:bg-white/[0.07]"
              onChange={(event) => setStartDate(event.target.value)}
              required
              type="date"
              value={startDate}
            />
          </label>
            <label className="grid gap-2 text-sm font-medium text-zinc-200">
            End date
            <input
              className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2.5 font-normal text-white outline-none transition focus:border-emerald-300/50 focus:bg-white/[0.07]"
              onChange={(event) => setEndDate(event.target.value)}
              required
              type="date"
              value={endDate}
            />
          </label>
            <label className="grid gap-2 text-sm font-medium text-zinc-200 md:col-span-2">
            Budget USD
            <input
              className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2.5 font-normal text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-300/50 focus:bg-white/[0.07]"
              min={1}
              onChange={(event) => setBudgetUsd(event.target.value)}
              placeholder="Optional"
              step="1"
              type="number"
              value={budgetUsd}
            />
          </label>

            <AnimatePresence>
              {error ? (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100 md:col-span-2"
                  exit={{ opacity: 0, y: -8 }}
                  initial={{ opacity: 0, y: -8 }}
                >
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                    <div>
                      <div className="font-semibold">Analysis failed</div>
                      <p className="mt-1 leading-6 text-rose-100/80">{error}</p>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <MapPin className="h-4 w-4 text-amber-300" />
                  Usage profile
                </div>
                <p className="mt-1 text-xs text-zinc-500">Signal intensity by workflow</p>
              </div>
              <Sparkles className="h-4 w-4 text-emerald-200" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {usageLabels.map(([key, label]) => (
                <label key={key} className="grid gap-2 text-sm font-medium text-zinc-200">
                  {label}
                  <select
                    className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2.5 font-normal text-white outline-none transition focus:border-emerald-300/50"
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
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-zinc-500">
            The backend remains the source of truth for estimates and plan selection.
          </p>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing route
              </>
            ) : (
              "Analyze trip"
            )}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {isSubmitting ? <LoadingState /> : null}
      </AnimatePresence>

      {analysis ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35 }}
        >
          <RecommendationCard analysis={analysis} />
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <UsageBreakdown breakdown={analysis.usageBreakdown} />
            <PlanComparison selected={analysis.selectedPlan} alternatives={analysis.alternatives} />
          </div>
          {analysis.connectivityGuide ? (
            <ConnectivityGuide guide={analysis.connectivityGuide} />
          ) : null}
          <AgentStepsTrace steps={analysis.agentSteps} />
        </motion.div>
      ) : null}
    </div>
  );
}

function LoadingState() {
  const steps = ["Estimating usage", "Scoring plans", "Generating guide", "Recording trace"];

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] p-5 text-emerald-50 shadow-xl shadow-emerald-950/20"
      exit={{ opacity: 0, y: -10 }}
      initial={{ opacity: 0, y: -10 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-200" />
            Running recommendation pipeline
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Connecta is keeping the deterministic plan decision intact while preparing the observable result.
          </p>
        </div>
        <div className="grid gap-2 sm:min-w-64">
          {steps.map((step, index) => (
            <motion.div
              animate={{ opacity: [0.35, 1, 0.35] }}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-emerald-100"
              key={step}
              transition={{ delay: index * 0.14, duration: 1.2, repeat: Infinity }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              {step}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
