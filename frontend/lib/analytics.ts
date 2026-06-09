import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
    capture_pageview: false,
    loaded: (ph) => {
    if (process.env.NODE_ENV === "development") ph.opt_out_capturing();
    },
  });
}

export function trackDestinationSearched(destination: string) {
  if (typeof window === "undefined") return;
  posthog.capture("destination_searched", { destination });
}

export function trackRecommendationViewed(
  destination: string,
  planName: string,
  priceUsd: number
) {
  if (typeof window === "undefined") return;
  posthog.capture("recommendation_viewed", { destination, planName, priceUsd });
}
