"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ChevronRight, MessageCircle, X } from "lucide-react";
import { analyzeTrip, formatDataGb } from "@/lib/graphql";
import type { PlanOption, TripAnalysis, TripInput, UsageLevel, TravelerType } from "@/lib/graphql";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ExtractedUsage = {
  maps?: UsageLevel;
  streaming?: UsageLevel;
  socialMedia?: UsageLevel;
  videoCalls?: UsageLevel;
  hotspot?: UsageLevel;
  work?: UsageLevel;
};

type ExtractedTrip = {
  destination: string;
  startDate: string;
  endDate: string;
  travelerType?: TravelerType;
  usage: ExtractedUsage;
};

type ChatApiResponse = {
  complete: boolean;
  clarification?: string | null;
  trip?: ExtractedTrip | null;
  acknowledgment?: string | null;
  error?: string;
};

type RefineLevel = "LIGHT" | "MODERATE" | "HEAVY";

const REFINE_LABELS: Record<RefineLevel, string> = {
  LIGHT: "Light",
  MODERATE: "Moderate",
  HEAVY: "Heavy",
};

const EXAMPLES = [
  "Japan, 10 days in August",
  "Thailand 2 weeks, beach trip",
  "Germany, 5 days, business",
];

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TripAnalysis | null>(null);
  const [resultTrip, setResultTrip] = useState<ExtractedTrip | null>(null);
  const [usageLevel, setUsageLevel] = useState<RefineLevel>("MODERATE");
  const [refining, setRefining] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom while chatting (typing indicator, clarification replies)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Scroll result section into view on fresh trip load (not on refine updates)
  useEffect(() => {
    if (resultTrip && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [resultTrip]);

  function handleReset() {
    setMessages([]);
    setResult(null);
    setResultTrip(null);
    setInput("");
    setUsageLevel("MODERATE");
    setRefining(false);
  }

  function handleCheckout(plan: PlanOption) {
    if (!resultTrip) return;
    const params = new URLSearchParams({
      data: formatDataGb(plan),
      destination: resultTrip.destination,
      plan: plan.name,
      price: plan.priceUsd.toFixed(2),
      provider: plan.provider,
      validity: `${plan.validityDays} days`,
    });
    window.location.href = `/checkout?${params.toString()}`;
  }

  async function handleRefine(level: RefineLevel) {
    if (!resultTrip || refining) return;
    setUsageLevel(level);
    setRefining(true);
    try {
      const tripInput: TripInput = {
        destination: resultTrip.destination,
        startDate: resultTrip.startDate,
        endDate: resultTrip.endDate,
        travelerType: resultTrip.travelerType ?? "SOLO",
        budgetUsd: undefined,
        usage: {
          maps: level,
          streaming: level,
          socialMedia: level,
          videoCalls: level,
          hotspot: level,
          work: level,
        },
      };
      const analysis = await analyzeTrip(tripInput);
      setResult(analysis);
    } catch {
      // silently retain existing result on error
    } finally {
      setRefining(false);
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const trimmed = text.trim();
    const history = [...messages];
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);

      const data = (await res.json()) as ChatApiResponse;

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Something went wrong. Please try again." },
        ]);
        return;
      }

      if (!data.complete || !data.trip) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.clarification ?? "Which destination are you travelling to?",
          },
        ]);
        return;
      }

      const ack = data.acknowledgment ?? "Finding your best plan…";
      setMessages((prev) => [...prev, { role: "assistant", content: ack }]);

      await new Promise<void>((resolve) => setTimeout(resolve, 800));

      const trip = data.trip;
      const tripInput: TripInput = {
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        travelerType: trip.travelerType ?? "SOLO",
        budgetUsd: undefined,
        usage: {
          maps: trip.usage.maps ?? "MODERATE",
          streaming: trip.usage.streaming ?? "MODERATE",
          socialMedia: trip.usage.socialMedia ?? "MODERATE",
          videoCalls: trip.usage.videoCalls ?? "MODERATE",
          hotspot: trip.usage.hotspot ?? "MODERATE",
          work: trip.usage.work ?? "MODERATE",
        },
      };

      const analysis = await analyzeTrip(tripInput);
      setResultTrip(trip);
      setResult(analysis);
      setUsageLevel("MODERATE");
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Could not load plans right now. Try the planner on this page." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  const showExamples = messages.length === 0 && !loading;
  const topAlternative = result?.alternatives[0] ?? null;

  return (
    <>
      {/* Chat panel */}
      <div
        aria-hidden={isOpen ? undefined : "true"}
        className={[
          "fixed bottom-24 right-6 z-50 flex w-[480px] max-h-[82vh] flex-col rounded-2xl bg-white shadow-2xl border border-slate-100 transition-all duration-200",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between rounded-t-2xl bg-slate-950 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-white">Plan with AI</p>
            <p className="mt-0.5 text-xs text-white/60">
              Describe your trip and I&apos;ll find the right plan
            </p>
          </div>
          <button
            aria-label="Close"
            className="ml-4 mt-0.5 shrink-0 text-white/60 transition-colors hover:text-white"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
          {showExamples ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-8">
              <p className="text-center text-xs text-slate-400">Try an example</p>
              <div className="flex flex-wrap justify-center gap-2">
                {EXAMPLES.map((pill) => (
                  <button
                    key={pill}
                    onClick={() => void sendMessage(pill)}
                    className="rounded-full border border-slate-200 px-3.5 py-1.5 text-sm text-slate-600 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                    type="button"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Chat messages */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <span
                    className={[
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-5",
                      msg.role === "user"
                        ? "ml-auto rounded-br-sm bg-slate-950 text-white"
                        : "rounded-bl-sm bg-slate-100 text-slate-800",
                    ].join(" ")}
                  >
                    {msg.content}
                  </span>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex justify-start">
                  <span className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              )}

              {/* Recommendation result */}
              {result && resultTrip && (
                <div ref={resultRef} className="mt-1 space-y-4">

                  {/* Usage level selector */}
                  <div className="border-b border-slate-100 pb-3">
                    <p className="mb-2 text-xs text-slate-400">Adjust usage</p>
                    <div className="flex items-center gap-1.5">
                      {(["LIGHT", "MODERATE", "HEAVY"] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => void handleRefine(level)}
                          disabled={refining}
                          className={
                            usageLevel === level
                              ? "rounded-full bg-orange-600 px-3 py-1 text-xs font-semibold text-white"
                              : "rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition-all hover:border-orange-300 hover:text-orange-600 disabled:opacity-40"
                          }
                          type="button"
                        >
                          {REFINE_LABELS[level]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <>
                      {/* Usage summary banner */}
                      <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-lg">🌍</span>
                          <span className="text-sm font-semibold text-slate-950">{resultTrip.destination}</span>
                        </div>
                        <div className="flex gap-5 text-xs text-slate-600">
                          <div>
                            <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Estimated usage</span>
                            <span className="font-semibold text-slate-950">{result.estimatedGb} GB</span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Recommended</span>
                            <span className="font-semibold text-teal-700">{result.recommendedGb} GB</span>
                          </div>
                        </div>
                        {result.recommendation && (
                          <p className="mt-2 text-xs leading-5 text-slate-600">{result.recommendation}</p>
                        )}
                      </div>

                      {/* Best match plan card */}
                      <div className="rounded-2xl border-2 border-orange-400 bg-white p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full border-[5px] border-orange-500" />
                            <span className="text-xs font-semibold text-orange-600">Best match</span>
                          </div>
                        </div>
                        <p className="text-3xl font-bold tracking-tight text-slate-950">
                          {formatDataGb(result.selectedPlan)}
                        </p>
                        <p className="mt-0.5 text-sm text-orange-500">{result.selectedPlan.validityDays} days</p>
                        <p className="mt-3 text-xl font-bold text-slate-950">
                          US${result.selectedPlan.priceUsd.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-400">{result.selectedPlan.provider}</p>
                        <button
                          onClick={() => handleCheckout(result.selectedPlan)}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                          type="button"
                        >
                          Choose this plan
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Single relevant alternative */}
                      {topAlternative && (
                        <div>
                          <p className="mb-2 text-xs font-medium text-slate-400">Another option</p>
                          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-slate-300">
                            <div className="flex items-center gap-3">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-slate-300" />
                              <div>
                                <p className="text-base font-bold text-slate-950">{formatDataGb(topAlternative)}</p>
                                <p className="text-xs text-slate-500">{topAlternative.validityDays} days &middot; US${topAlternative.priceUsd.toFixed(2)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleCheckout(topAlternative)}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all hover:border-slate-950 hover:bg-slate-950 hover:text-white"
                              type="button"
                              aria-label={`Choose ${topAlternative.name}`}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                  </>

                  {/* Before departure guide */}
                  {!refining &&
                    result.connectivityGuide?.beforeDeparture &&
                    result.connectivityGuide.beforeDeparture.length > 0 && (
                      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Before departure
                        </p>
                        <ul className="space-y-2">
                          {result.connectivityGuide.beforeDeparture.map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs leading-5 text-slate-700">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Reset */}
                  {!refining && (
                    <button
                      onClick={handleReset}
                      className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                      type="button"
                    >
                      Plan another trip
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          className="flex shrink-0 items-center gap-2 border-t border-slate-100 px-4 py-3"
          onSubmit={handleSubmit}
        >
          <input
            className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-orange-300 focus:outline-none disabled:opacity-50"
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
            placeholder="Describe your trip…"
            type="text"
            value={input}
          />
          <button
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            disabled={loading || !input.trim()}
            type="submit"
          >
            Send
          </button>
        </form>
      </div>

      {/* Floating toggle button */}
      <button
        aria-label={isOpen ? "Close trip planner" : "Open AI trip planner"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
