"use client";

import { useMemo, useState } from "react";

import { CountryPlanSelector } from "@/components/CountryPlanSelector";
import { TripForm } from "@/components/TripForm";
import { destinationOptions, plansForDestination } from "@/lib/destination-catalog";

type PlannerExperienceProps = {
  initialDestination?: string;
  initialStartDate?: string;
  initialEndDate?: string;
};

export function PlannerExperience({
  initialDestination = "Japan",
  initialStartDate = "2026-06-10",
  initialEndDate = "2026-06-17"
}: PlannerExperienceProps) {
  const [tripDetails, setTripDetails] = useState({
    destination: initialDestination,
    startDate: initialStartDate,
    endDate: initialEndDate
  });

  const selectedDestination = useMemo(() => {
    const normalizedDestination = tripDetails.destination.trim().toLowerCase();

    return (
      destinationOptions.find((destination) => destination.name.toLowerCase() === normalizedDestination) ??
      destinationOptions.find((destination) => destination.name === initialDestination) ??
      destinationOptions.find((destination) => destination.name === "Japan") ??
      destinationOptions[0]
    );
  }, [initialDestination, tripDetails.destination]);

  const plans = useMemo(() => plansForDestination(selectedDestination.name), [selectedDestination.name]);

  return (
    <div className="grid gap-10">
      <TripForm
        initialDestination={initialDestination}
        initialEndDate={initialEndDate}
        initialStartDate={initialStartDate}
        onTripDetailsChange={setTripDetails}
      />

      <CountryPlanSelector
        destination={selectedDestination}
        endDate={tripDetails.endDate}
        plans={plans}
        startDate={tripDetails.startDate}
        title="Choose it yourself"
      />
    </div>
  );
}
