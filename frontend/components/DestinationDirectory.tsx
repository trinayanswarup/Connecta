"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Globe2, MapPin, Search } from "lucide-react";

import { destinationHref, type DestinationKind, type DestinationOption } from "@/lib/destination-catalog";

type DestinationDirectoryProps = {
  destinations: DestinationOption[];
};

const filters: Array<{ label: string; value: "popular" | "all" | DestinationKind }> = [
  { label: "Popular", value: "popular" },
  { label: "Regional plans", value: "regional" },
  { label: "Countries", value: "country" },
  { label: "Global", value: "global" },
  { label: "All destinations", value: "all" }
];

const popularNames = new Set(["United States", "United Kingdom", "Japan", "Italy", "Thailand", "India", "Brazil", "Singapore", "Mexico"]);
const pageSize = 18;

export function DestinationDirectory({ destinations }: DestinationDirectoryProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"popular" | "all" | DestinationKind>("popular");
  const [page, setPage] = useState(1);
  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;
  const filteredDestinations = destinations.filter((destination) => {
    const matchesQuery =
      !isSearching ||
      destination.name.toLowerCase().includes(normalizedQuery) ||
      destination.region.toLowerCase().includes(normalizedQuery);

    if (isSearching) {
      return matchesQuery;
    }

    if (activeFilter === "all") {
      return true;
    }

    const matchesFilter =
      activeFilter === "popular" ? popularNames.has(destination.name) : destination.kind === activeFilter;

    return matchesFilter;
  });
  const shouldPaginate = isSearching || activeFilter === "all";
  const totalPages = Math.max(1, Math.ceil(filteredDestinations.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const visibleDestinations = shouldPaginate
    ? filteredDestinations.slice(pageStart, pageStart + pageSize)
    : filteredDestinations.slice(0, 9);
  const isFullDirectory = isSearching || activeFilter === "all";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-48px_rgba(15,23,42,0.45)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-700">Destination finder</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">
            {isFullDirectory ? "Explore every country and region" : "Popular eSIM destinations"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isFullDirectory
              ? "Every destination includes multiple data sizes, validity windows, and prices."
              : "Start with 9 popular countries, or search any country, region, or global plan."}
          </p>
        </div>
        <div className="flex min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-[#fbfaf7] px-3 py-2.5 sm:min-w-80">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
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
                  : "border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50"
              }`}
              key={filter.value}
              onClick={() => {
                setActiveFilter(filter.value);
                setPage(1);
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
            className="group relative min-h-28 overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_18px_60px_-46px_rgba(15,23,42,0.55)]"
            href={destinationHref(destination.name)}
            key={destination.name}
          >
            <div className="relative z-10 flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-orange-50 text-orange-700 shadow-sm">
                {destination.kind === "country" ? <MapPin className="h-5 w-5" /> : <Globe2 className="h-5 w-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-xs font-medium text-slate-500">eSIM</span>
                <span className="mt-1 block text-lg font-semibold text-slate-950">{destination.name}</span>
                <span className="mt-1 block text-sm text-slate-500">{destination.region}</span>
              </span>
              <ArrowRight className="mt-8 h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-orange-700" />
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

      {!isFullDirectory ? (
        <div className="mt-6 flex justify-center border-t border-slate-100 pt-6">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50"
            onClick={() => {
              setActiveFilter("all");
              setPage(1);
            }}
            type="button"
          >
            Show all countries and regions
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {isFullDirectory && filteredDestinations.length > 0 ? (
        <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {pageStart + 1} - {Math.min(pageStart + visibleDestinations.length, filteredDestinations.length)} of{" "}
            {filteredDestinations.length} destinations
          </p>
          {totalPages > 1 ? (
            <div className="flex items-center gap-2">
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={safePage === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="rounded-md border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800">
                {safePage}
              </span>
              <span>of {totalPages}</span>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={safePage === totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

