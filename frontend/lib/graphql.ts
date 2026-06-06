export const graphqlEndpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? "http://localhost:8080/graphql";

export type TravelerType = "SOLO" | "COUPLE" | "FAMILY" | "BUSINESS";
export type UsageLevel = "NONE" | "LIGHT" | "MODERATE" | "HEAVY";
export type AgentStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED";

export type UsageInput = {
  streaming: UsageLevel;
  videoCalls: UsageLevel;
  hotspot: UsageLevel;
  maps: UsageLevel;
  socialMedia: UsageLevel;
  work: UsageLevel;
};

export type TripInput = {
  destination: string;
  startDate: string;
  endDate: string;
  travelerType: TravelerType;
  budgetUsd?: number;
  usage: UsageInput;
};

export type UsageBreakdownResult = Record<keyof UsageInput, number>;

export type PlanOption = {
  id: string;
  provider: string;
  name: string;
  priceUsd: number;
  dataGb: number;
  dataLabel?: string;
  validityDays: number;
  tradeoff: string;
};

export type ConnectivityGuideResult = {
  beforeDeparture: string[];
  airportSetup: string[];
  offlineStrategy: string[];
  backupInternet: string[];
  emergencyAccess: string[];
};

export type AgentStep = {
  name: string;
  status: AgentStatus;
  durationMs: number;
  inputSummary?: string | null;
  outputSummary?: string | null;
  retries: number;
  error?: string | null;
};

export type TripAnalysis = {
  tripId: string;
  agentRunId: string;
  estimatedGb: number;
  recommendedGb: number;
  confidence: number;
  usageBreakdown: UsageBreakdownResult;
  selectedPlan: PlanOption;
  recommendation: string;
  alternatives: PlanOption[];
  connectivityGuide?: ConnectivityGuideResult | null;
  agentSteps: AgentStep[];
};

const ANALYZE_TRIP_MUTATION = `
  mutation AnalyzeTrip($input: TripInput!) {
    analyzeTrip(input: $input) {
      tripId
      agentRunId
      estimatedGb
      recommendedGb
      confidence
      usageBreakdown {
        maps
        streaming
        socialMedia
        videoCalls
        hotspot
        work
      }
      selectedPlan {
        id
        provider
        name
        priceUsd
        dataGb
        validityDays
        tradeoff
      }
      recommendation
      alternatives {
        id
        provider
        name
        priceUsd
        dataGb
        validityDays
        tradeoff
      }
      connectivityGuide {
        beforeDeparture
        airportSetup
        offlineStrategy
        backupInternet
        emergencyAccess
      }
      agentSteps {
        name
        status
        durationMs
        inputSummary
        outputSummary
        retries
        error
      }
    }
  }
`;

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export async function analyzeTrip(input: TripInput): Promise<TripAnalysis> {
  const response = await fetch(graphqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: ANALYZE_TRIP_MUTATION,
      variables: { input }
    })
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed with ${response.status}`);
  }

  const payload = (await response.json()) as GraphQLResponse<{
    analyzeTrip: TripAnalysis;
  }>;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }
  if (!payload.data) {
    throw new Error("GraphQL response did not include data");
  }

  return payload.data.analyzeTrip;
}
