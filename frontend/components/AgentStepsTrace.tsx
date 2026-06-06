import { CheckCircle2, ChevronDown } from "lucide-react";

import type { AgentStep } from "@/lib/graphql";

export function AgentStepsTrace({ steps }: { steps: AgentStep[] }) {
  return (
    <details className="group rounded-md bg-white p-5 shadow-[0_18px_70px_-62px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/80 sm:p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">How we chose this plan</h2>
          <p className="mt-1.5 text-sm text-slate-500">A quick look at the checks behind your recommendation.</p>
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
      </summary>

      <div className="mt-5 grid gap-3">
        {steps.map((step, index) => (
          <div className="flex gap-3 rounded-md bg-[#fbfaf7] p-4" key={`${step.name}-${index}`}>
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-orange-50 text-orange-700">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-medium text-slate-950">{friendlyStepName(step.name)}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{friendlyStepSummary(step.name)}</p>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

function friendlyStepName(name: string) {
  switch (name) {
    case "Usage estimation":
      return "Estimated your data needs";
    case "Plan optimization":
      return "Compared matching plans";
    case "Recommendation summary":
      return "Prepared the recommendation";
    case "AI guide generation":
      return "Prepared setup guidance";
    case "Save trip":
      return "Made the result ready to view";
    default:
      return "Checked trip details";
  }
}

function friendlyStepSummary(name: string) {
  switch (name) {
    case "Usage estimation":
      return "We used your trip length and phone habits to estimate how much data you may need.";
    case "Plan optimization":
      return "We compared plan size, price, validity, and destination fit.";
    case "Recommendation summary":
      return "We turned the plan match into a simple recommendation.";
    case "AI guide generation":
      return "We prepared practical setup steps for before and during your trip.";
    case "Save trip":
      return "Your recommendation is available in this session.";
    default:
      return "This check helped shape the final recommendation.";
  }
}

