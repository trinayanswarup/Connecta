# Agent Flow

1. Validate trip input.
2. Recall similar past trips.
3. Estimate expected data usage.
4. Compare available plans.
5. Generate recommendation reasoning.
6. Generate connectivity setup guide.
7. Save trip analysis.
8. Store trace logs for every step.

## Design Notes

- The usage estimator and plan optimizer should remain deterministic.
- Groq should explain, personalize, and regenerate recommendations, not own core calculations.
- Each agent step should be independently testable.
- The orchestrator should coordinate steps without embedding business rules.
