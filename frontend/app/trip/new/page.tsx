import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PlannerExperience } from "@/components/PlannerExperience";

type NewTripPageProps = {
  searchParams?: Promise<{
    destination?: string;
    startDate?: string;
    endDate?: string;
  }>;
};

export default async function NewTripPage({ searchParams }: NewTripPageProps) {
  const params = await searchParams;
  const initialDestination =
    typeof params?.destination === "string" && params.destination.trim().length >= 2
      ? params.destination.trim()
      : undefined;
  const initialStartDate = isIsoDate(params?.startDate) ? params?.startDate : undefined;
  const initialEndDate = isIsoDate(params?.endDate) ? params?.endDate : undefined;

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-5 py-6 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-10 flex items-center justify-between border-b border-slate-200/80 pb-5">
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950" href="/">
            <ArrowLeft className="h-4 w-4" />
            Connecta
          </Link>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            Travel data plans
          </span>
        </nav>

        <section className="pb-12 pt-4 lg:pb-16">
          <PlannerExperience
            initialDestination={initialDestination}
            initialEndDate={initialEndDate}
            initialStartDate={initialStartDate}
          />
        </section>
      </div>
    </main>
  );
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

