import { createClient } from "./supabase/client";
import { getSessionId } from "./session";

export type StoredPlan = {
  ID?: string;
  Provider?: string;
  Name?: string;
  PriceUSD?: number;
  DataGB?: number;
  ValidityDays?: number;
};

export type StoredRecommendation = {
  text?: string;
  selected_plan?: StoredPlan;
  alternatives?: StoredPlan[];
};

export type ConfirmedPlan = {
  Provider?: string;
  Name?: string;
  PriceUSD?: number;
  DataLabel?: string;
  ValidityDays?: number;
};

export type TripRow = {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  traveler_type: string;
  estimated_gb: number;
  recommended_gb: number;
  recommendation: StoredRecommendation;
  created_at: string;
  confirmed_at: string | null;
  confirmed_plan: ConfirmedPlan | null;
};

export async function fetchTripHistory(): Promise<TripRow[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const sessionId = getSessionId();
  if (!sessionId) return [];

  const { data, error } = await supabase
    .from("trips")
    .select(
      "id, destination, start_date, end_date, traveler_type, estimated_gb, recommended_gb, recommendation, created_at, confirmed_at, confirmed_plan"
    )
    .eq("user_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    console.error("fetchTripHistory error:", error);
    return [];
  }

  return data as TripRow[];
}
