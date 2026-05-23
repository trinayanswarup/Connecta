"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Globe2, MapPin, Search } from "lucide-react";

import { plansForDestination, type DestinationKind, type DestinationOption } from "@/lib/destination-catalog";

type DestinationDirectoryProps = {
  destinations: DestinationOption[];
};

const filters: Array<{ label: string; value: "popular" | DestinationKind }> = [
  { label: "Popular", value: "popular" },
  { label: "Regional plans", value: "regional" },
  { label: "Countries", value: "country" },
  { label: "Global", value: "global" }
];

const popularNames = new Set(["Global", "Europe", "Asia", "United States", "United Kingdom", "Japan", "Italy", "Thailand", "India", "Brazil", "Singapore", "Mexico"]);

export function DestinationDirectory({ destinations }: DestinationDirectoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"popular" | DestinationKind>("popular");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredDestinations = destinations.filter((destination) => {
    const matchesFilter =
      activeFilter === "popular" ? popularNames.has(destination.name) : destination.kind === activeFilter;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      destination.name.toLowerCase().includes(normalizedQuery) ||
      destination.region.toLowerCase().includes(normalizedQuery);

    return matchesFilter && matchesQuery;
  });
  const visibleDestinations = isOpen || normalizedQuery.length > 0 ? filteredDestinations : filteredDestinations.slice(0, 18);
  const hasHiddenDestinations = filteredDestinations.length > visibleDestinations.length;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-48px_rgba(15,23,42,0.45)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-700">Destination finder</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">Explore every country and region</h2>
          <p className="mt-2 text-sm text-slate-500">Every destination includes multiple data sizes, validity windows, and prices.</p>
        </div>
        <div className="flex min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-[#fbfaf7] px-3 py-2.5 sm:min-w-80">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search countries or regions"
            value={query}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;
          return (
            <button
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50"
              }`}
              key={filter.value}
              onClick={() => {
                setActiveFilter(filter.value);
                setIsOpen(false);
              }}
              type="button"
            >
              {isActive ? <Check className="h-4 w-4" /> : null}
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleDestinations.map((destination) => (
          <Link
            className="group relative min-h-28 overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_18px_60px_-46px_rgba(15,23,42,0.55)]"
            href={`/trip/new?destination=${encodeURIComponent(destination.name)}`}
            key={destination.name}
          >
            <div className="relative z-10 flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-700 shadow-sm">
                {destination.kind === "country" ? <MapPin className="h-5 w-5" /> : <Globe2 className="h-5 w-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-xs font-medium text-slate-500">eSIM</span>
                <span className="mt-1 block text-lg font-semibold text-slate-950">{destination.name}</span>
                <span className="mt-1 block text-sm text-slate-500">{destination.region}</span>
              </span>
              <ArrowRight className="mt-8 h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-700" />
            </div>
            <div className="relative z-10 mt-5 flex flex-wrap gap-2">
              {plansForDestination(destination.name)
                .slice(0, 3)
                .map((plan) => (
                  <span className="rounded-full bg-[#fbfaf7] px-2.5 py-1 text-xs font-medium text-slate-600" key={plan.data}>
                    {plan.data} / {plan.days}
                  </span>
                ))}
            </div>
            <div className="absolute bottom-0 right-0 h-16 w-44 rounded-tl-[100%] bg-slate-50" />
          </Link>
        ))}
      </div>

      {filteredDestinations.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-[#fbfaf7] p-6 text-center text-sm text-slate-500">
          No destinations match that search yet.
        </div>
      ) : null}

      {hasHiddenDestinations || isOpen ? (
        <div className="mt-6 flex justify-center">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50"
            onClick={() => setIsOpen((current) => !current)}
            type="button"
          >
            {isOpen ? "Show fewer" : "View all destinations"}
            <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
