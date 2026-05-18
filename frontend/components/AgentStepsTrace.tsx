import type { AgentStep } from "@/lib/graphql";

export function AgentStepsTrace({ steps }: { steps: AgentStep[] }) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Trace</h2>
      <div className="mt-4 space-y-3">
        {steps.map((step) => (
          <div
            key={`${step.name}-${step.durationMs}`}
            className="grid gap-2 rounded-md border border-border p-3 text-sm md:grid-cols-[1fr_auto]"
          >
            <div>
              <div className="font-medium">{step.name}</div>
              <div className="mt-1 text-slate-600">
                {step.outputSummary ?? step.inputSummary ?? "Step recorded"}
              </div>
              {step.error ? <div className="mt-1 text-red-600">{step.error}</div> : null}
            </div>
            <div className="flex items-center gap-3 text-xs uppercase text-slate-500">
              <span>{step.status}</span>
              <span>{step.durationMs} ms</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
