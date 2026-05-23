"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import { destinationOptions } from "@/lib/destination-catalog";

type HomeSearchProps = {
  defaultDestination?: string;
};

export function HomeSearch({ defaultDestination = "Japan" }: HomeSearchProps) {
  const router = useRouter();
  const [destination, setDestination] = useState(defaultDestination);
  const [startDate, setStartDate] = useState("2026-06-10");
  const [endDate, setEndDate] = useState("2026-06-17");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formDestination = String(formData.get("destination") ?? "").trim();
    const formStartDate = String(formData.get("startDate") ?? "");
    const formEndDate = String(formData.get("endDate") ?? "");

    const params = new URLSearchParams();
    if (formDestination) {
      params.set("destination", formDestination);
    }
    if (formStartDate) {
      params.set("startDate", formStartDate);
    }
    if (formEndDate) {
      params.set("endDate", formEndDate);
    }

    router.push(`/trip/new?${params.toString()}`);
  }

  return (
    <form
      className="grid gap-3 rounded-lg border border-slate-200 bg-[#fbfaf7] p-3 sm:grid-cols-[1.12fr_0.74fr_0.74fr_auto] sm:items-end"
      onSubmit={handleSubmit}
    >
      <label className="grid gap-2 text-sm font-semibold text-slate-800">
        Destination
        <span className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5">
          <MapPin className="h-4 w-4 shrink-0 text-teal-600" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
            list="connecta-home-destinations"
            minLength={2}
            name="destination"
            onChange={(event) => setDestination(event.target.value)}
            placeholder="Where are you traveling?"
            required
            value={destination}
          />
          <datalist id="connecta-home-destinations">
            {destinationOptions.map((option) => (
              <option key={option.name} value={option.name} />
            ))}
          </datalist>
        </span>
      </label>

      <label className="grid gap-2 text-sm font-semibold text-slate-800">
        Start
        <span className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5">
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none"
            name="startDate"
            onChange={(event) => setStartDate(event.target.value)}
            type="date"
            value={startDate}
          />
        </span>
      </label>

      <label className="grid gap-2 text-sm font-semibold text-slate-800">
        End
        <span className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5">
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none"
            name="endDate"
            onChange={(event) => setEndDate(event.target.value)}
            type="date"
            value={endDate}
          />
        </span>
      </label>

      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        type="submit"
      >
        Find my plan
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
