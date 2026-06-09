import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
};

export async function fetchTripHistory(): Promise<TripRow[]> {
  try {
    const { data, error } = await supabase
      .from("trips")
      .select(
        "id, destination, start_date, end_date, traveler_type, estimated_gb, recommended_gb, recommendation, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("fetchTripHistory error:", error.message);
      return [];
    }
    return (data as TripRow[]) ?? [];
  } catch {
    return [];
  }
}
