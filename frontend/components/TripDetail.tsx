"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Battery, CheckCircle2, Signal } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { fetchTripById, fetchUsageSnapshots, type TripRow, type UsageSnapshotRow } from "@/lib/supabase";

function formatTripDateRange(start: string, end: string): string {
  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatConfirmedSource(provider?: string): string {
  if (!provider || provider === "Connecta" || provider === "Connecta Local") return "Confirmed";
  return `Confirmed via ${provider}`;
}

function formatDataAmount(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(0)} MB`;
}

export default function TripDetail({ tripId }: { tripId: string }) {
  const [trip, setTrip] = useState<TripRow | null>(null);
  const [usage, setUsage] = useState<UsageSnapshotRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [tripData, usageData] = await Promise.all([
        fetchTripById(tripId),
        fetchUsageSnapshots(tripId)
      ]);
      if (!cancelled) {
        setTrip(tripData);
        setUsage(usageData);
        setLoading(false);
      }
    }

    load();
    // Poll every 30s so this stays live while SailGuard keeps pushing
    // snapshots — matches SailGuard's own 30s usage poll interval.
    const interval = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [tripId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] px-6 py-12 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] px-6 py-12 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-slate-500">Trip not found.</p>
          <Link href="/history" className="mt-3 inline-block text-orange-600 hover:text-orange-700">
            Back to history
          </Link>
        </div>
      </main>
    );
  }

  const latest = usage[usage.length - 1];
  const chartData = usage.map((u) => ({
    time: formatTime(u.captured_at),
    mb: Math.round(u.data_used_mb)
  }));

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-6 py-12 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to history
        </Link>

        <h1 className="mt-4 text-2xl font-semibold text-slate-950">{trip.destination}</h1>
        <p className="mt-1 text-slate-500">{formatTripDateRange(trip.start_date, trip.end_date)}</p>

        {trip.confirmed_plan && (
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                {formatConfirmedSource(trip.confirmed_plan.Provider)}
              </p>
              <p className="mt-0.5 font-semibold text-slate-950">
                {trip.confirmed_plan.DataLabel ?? "Plan"}
                {trip.confirmed_plan.ValidityDays ? ` · ${trip.confirmed_plan.ValidityDays} days` : ""}
              </p>
              <p className="text-sm text-slate-500">US${(trip.confirmed_plan.PriceUSD ?? 0).toFixed(2)}</p>
            </div>
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-950">Live usage</h2>
          <p className="text-sm text-slate-500">
            Synced from SailGuard every 30 seconds while a trip is active.
          </p>

          {usage.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-8 text-center">
              <p className="text-slate-500">
                No usage data yet. Once this trip is active in SailGuard with this session
                linked, real device usage will start showing up here automatically.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-100 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Data used</p>
                  <p className="mt-1 text-xl font-semibold text-slate-950">
                    {formatDataAmount(latest.data_used_mb)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-4">
                  <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-slate-400">
                    <Battery className="h-3.5 w-3.5" /> Battery
                  </p>
                  <p className="mt-1 text-xl font-semibold text-slate-950">
                    {latest.battery_pct != null ? `${latest.battery_pct}%` : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-4">
                  <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-slate-400">
                    <Signal className="h-3.5 w-3.5" /> Network
                  </p>
                  <p className="mt-1 text-xl font-semibold text-slate-950">
                    {latest.network_type ?? "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-64 rounded-2xl border border-slate-100 bg-white p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EA580C" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#EA580C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(v) => `${v} MB`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value} MB`, "Data used"]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="mb"
                      stroke="#EA580C"
                      strokeWidth={2}
                      fill="url(#usageFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Last synced {formatTime(latest.captured_at)} · {usage.length} reading
                {usage.length === 1 ? "" : "s"}
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
