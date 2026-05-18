# API Contract

The first vertical flow centers on `analyzeTrip`.

```graphql
mutation AnalyzeTrip($input: TripInput!) {
  analyzeTrip(input: $input) {
    tripId
    agentRunId
    estimatedGb
    recommendedGb
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
```

## Query Surface

- `trips`
- `trip(id)`
- `agentRun(id)`

## Validation

- Frontend validates user input with Zod.
- Backend validates GraphQL input before service execution.
- AI responses are parsed as structured JSON and validated before use.
- Fallback responses are returned when AI output is invalid or unavailable.
