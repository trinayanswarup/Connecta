"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import { destinationHref, destinationOptions } from "@/lib/destination-catalog";

type HomeSearchProps = {
  defaultDestination?: string;
  variant?: "horizontal" | "hero";
};

export function HomeSearch({ defaultDestination = "Japan", variant = "horizontal" }: HomeSearchProps) {
  const router = useRouter();
  const [destination, setDestination] = useState(defaultDestination);
  const [startDate, setStartDate] = useState("2026-06-10");
  const [endDate, setEndDate] = useState("2026-06-17");
  const isHero = variant === "hero";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formDestination = String(formData.get("destination") ?? "").trim();
    const formStartDate = String(formData.get("startDate") ?? "");
    const formEndDate = String(formData.get("endDate") ?? "");

    router.push(destinationHref(formDestination, { startDate: formStartDate, endDate: formEndDate }));
  }

  return (
    <form
      className={
        isHero
          ? "grid max-w-[31.5rem] gap-3 sm:grid-cols-2"
          : "grid gap-4 sm:grid-cols-[1.12fr_0.74fr_0.74fr_auto] sm:items-end"
      }
      onSubmit={handleSubmit}
    >
      <label className={isHero ? "grid gap-2 text-sm font-semibold text-slate-950 sm:col-span-2" : "grid gap-2 text-sm font-semibold text-slate-700"}>
        {isHero ? "Where are you traveling?" : "Destination"}
        <span
          className={
            isHero
              ? "flex min-h-14 items-center gap-3 rounded-md border border-slate-200 bg-white px-4 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.55)]"
              : "flex min-h-14 items-center gap-3 rounded-md bg-white px-4 ring-1 ring-slate-200/80 transition focus-within:ring-4 focus-within:ring-orange-100"
          }
        >
          <MapPin className="h-4 w-4 shrink-0 text-orange-600" />
          {isHero ? <span className="h-5 w-px bg-slate-200" /> : null}
          <input
            className="min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400 sm:text-sm"
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

      <label className={isHero ? "grid gap-2 text-sm font-semibold text-slate-950" : "grid gap-2 text-sm font-semibold text-slate-700"}>
        {isHero ? "When do you leave?" : "Start"}
        <span
          className={
            isHero
              ? "flex min-h-14 items-center gap-3 rounded-md border border-slate-200 bg-white px-4 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.55)]"
              : "flex min-h-14 items-center gap-3 rounded-md bg-white px-4 ring-1 ring-slate-200/80 transition focus-within:ring-4 focus-within:ring-orange-100"
          }
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
          {isHero ? <span className="h-5 w-px bg-slate-200" /> : null}
          <input
            className="min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none sm:text-sm"
            name="startDate"
            onChange={(event) => setStartDate(event.target.value)}
            type="date"
            value={startDate}
          />
        </span>
      </label>

      <label className={isHero ? "grid gap-2 text-sm font-semibold text-slate-950" : "grid gap-2 text-sm font-semibold text-slate-700"}>
        {isHero ? "When do you return?" : "End"}
        <span
          className={
            isHero
              ? "flex min-h-14 items-center gap-3 rounded-md border border-slate-200 bg-white px-4 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.55)]"
              : "flex min-h-14 items-center gap-3 rounded-md bg-white px-4 ring-1 ring-slate-200/80 transition focus-within:ring-4 focus-within:ring-orange-100"
          }
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
          {isHero ? <span className="h-5 w-px bg-slate-200" /> : null}
          <input
            className="min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none sm:text-sm"
            name="endDate"
            onChange={(event) => setEndDate(event.target.value)}
            type="date"
            value={endDate}
          />
        </span>
      </label>

      <button
        className={
          isHero
            ? "inline-flex h-14 items-center justify-center gap-2 rounded-md bg-[#e94f13] px-5 text-base font-semibold text-white shadow-[0_18px_44px_-32px_rgba(217,76,13,0.45)] transition-colors duration-200 hover:bg-[#f26822] sm:col-span-2"
            : "inline-flex h-14 min-w-[10rem] cursor-pointer items-center justify-center gap-2 rounded-md bg-slate-950 px-6 text-sm font-semibold text-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.7)] transition-colors duration-200 hover:bg-slate-800"
        }
        type="submit"
      >
        <span className="whitespace-nowrap">{isHero ? "Search plan" : "Find my plan"}</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

