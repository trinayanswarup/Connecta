"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock3, GitBranch, Loader2, MinusCircle } from "lucide-react";

import type { AgentStep } from "@/lib/graphql";

export function AgentStepsTrace({ steps }: { steps: AgentStep[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-zinc-950/70 p-5 shadow-xl shadow-black/20 backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <GitBranch className="h-5 w-5 text-emerald-200" />
            Agent execution timeline
          </div>
          <p className="mt-1 text-sm text-zinc-500">Latency, status, and fallback visibility from the recommendation run</p>
        </div>
        <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">{steps.length} steps</span>
      </div>

      <div className="relative mt-6">
        <div className="absolute bottom-4 left-4 top-4 w-px bg-white/10" />
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = iconForStatus(step.status);

            return (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="relative grid gap-3 pl-11 md:grid-cols-[1fr_auto]"
                initial={{ opacity: 0, x: -12 }}
                key={`${step.name}-${step.durationMs}-${index}`}
                transition={{ delay: index * 0.08, duration: 0.28 }}
              >
                <span className={`absolute left-0 top-1 grid h-8 w-8 place-items-center rounded-full border ${statusClass(step.status)}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="rounded-md border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold text-white">{step.name}</div>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs uppercase tracking-[0.12em] text-zinc-400">
                      {step.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-zinc-400">
                    {step.outputSummary ?? step.inputSummary ?? "Step recorded"}
                  </div>
                  {step.error ? <div className="mt-2 text-sm leading-6 text-rose-200">{step.error}</div> : null}
                </div>
                <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-300 md:self-start">
                  <Clock3 className="h-4 w-4 text-amber-300" />
                  {step.durationMs} ms
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function iconForStatus(status: AgentStep["status"]) {
  switch (status) {
    case "COMPLETED":
      return CheckCircle2;
    case "FAILED":
      return AlertCircle;
    case "RUNNING":
      return Loader2;
    case "SKIPPED":
      return MinusCircle;
    default:
      return Clock3;
  }
}

function statusClass(status: AgentStep["status"]) {
  switch (status) {
    case "COMPLETED":
      return "border-emerald-300/30 bg-emerald-300/10 text-emerald-200";
    case "FAILED":
      return "border-rose-300/30 bg-rose-400/10 text-rose-200";
    case "SKIPPED":
      return "border-amber-300/30 bg-amber-300/10 text-amber-200";
    default:
      return "border-white/10 bg-white/[0.05] text-zinc-300";
  }
}
