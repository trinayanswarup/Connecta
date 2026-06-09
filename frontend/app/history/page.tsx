"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, MapPin, Wifi } from "lucide-react";
import { fetchTripHistory, type TripRow, type StoredPlan } from "@/lib/supabase";

function formatTripDateRange(start: string, end: string): string {
  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTravelerType(t: string): string {
  const map: Record<string, string> = {
    SOLO: "Solo",
    COUPLE: "Couple",
    FAMILY: "Family",
    BUSINESS: "Business",
  };
  return map[t] ?? t;
}

function formatPlanData(plan: StoredPlan): string {
  if ((plan.DataGB ?? 0) >= 999) return "Unlimited";
  return `${plan.DataGB ?? 0} GB`;
}

function SkeletonCard() {
  return (
    <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <MapPin className="mb-4 h-12 w-12 text-slate-300" />
      <p className="text-lg font-semibold text-slate-400">No trips yet</p>
      <p className="mt-1 text-sm text-slate-400">Start by describing your trip in the chat</p>
      <Link
        href="/trip/new"
        className="mt-6 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
      >
        Plan a trip
      </Link>
    </div>
  );
}

function TripCard({ trip }: { trip: TripRow }) {
  const plan = trip.recommendation?.selected_plan;
  const hasplan = plan && plan.Name;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-950">{trip.destination}</p>
          <p className="mt-0.5 text-sm text-slate-500">
            {formatTripDateRange(trip.start_date, trip.end_date)}
          </p>
        </div>
        <span className="shrink-0 text-xs text-slate-400">{formatCreatedAt(trip.created_at)}</span>
      </div>

      {/* Plan row */}
      {hasplan && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
              Recommended plan
            </p>
            <p className="mt-0.5 font-semibold text-slate-950">
              {formatPlanData(plan)} &middot; {plan.ValidityDays} days
            </p>
            <p className="text-sm text-slate-500">US${(plan.PriceUSD ?? 0).toFixed(2)}</p>
          </div>
          <Link
            href={`/trip/new?destination=${encodeURIComponent(trip.destination)}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all hover:border-slate-950 hover:bg-slate-950 hover:text-white"
            aria-label="View details"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Tags row */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-slate-200 px-3 py-0.5 text-xs text-slate-500">
          {trip.estimated_gb} GB estimated
        </span>
        <span className="rounded-full border border-slate-200 px-3 py-0.5 text-xs text-slate-500">
          {formatTravelerType(trip.traveler_type)}
        </span>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTripHistory()
      .then(setTrips)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-slate-950">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-[#FAFAF8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <Link className="flex items-center gap-2.5" href="/">
            <Wifi className="h-5 w-5 text-orange-600" />
            <span className="text-xl font-bold text-slate-950">Connecta</span>
          </Link>
          <Link
            href="/trip/new"
            className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
          >
            Plan a trip
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-12 sm:px-8">
        {/* Back nav */}
        <Link
          href="/trip/new"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to planner
        </Link>

        {/* Header */}
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Your trips</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Past recommendations</h1>
        <p className="mt-2 text-sm text-slate-500">Your recent eSIM plan searches</p>

        {/* Content */}
        <div className="mt-8 space-y-4">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : trips.length === 0 ? (
            <EmptyState />
          ) : (
            trips.map((trip) => <TripCard key={trip.id} trip={trip} />)
          )}
        </div>
      </div>
    </main>
  );
}
