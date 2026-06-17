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
  return [];
}
