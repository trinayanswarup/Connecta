# Architecture

Connecta is a modular monorepo with a Next.js frontend and a Go backend exposed through GraphQL.

```text
User
  -> Next.js frontend
  -> GraphQL API
  -> Go backend
     -> Agent orchestrator
     -> Memory agent
     -> Usage estimator agent
     -> Plan optimizer agent
     -> Connectivity guide agent
     -> Groq client
     -> Trace logger
  -> Supabase Postgres
```

## Boundaries

- Frontend owns interaction, form validation, visualization, and rendering.
- GraphQL resolvers translate API inputs and outputs only.
- Services own business use cases.
- Agents own one bounded task each.
- Repositories own persistence.
- Infrastructure packages own external services and configuration.

## Observability

Every agent step should produce a trace record containing:

- Step name.
- Status.
- Duration.
- Input summary.
- Output summary.
- Retry count.
- Error detail when relevant.

The trace is both a debugging aid and a user-facing explanation of the AI-native workflow.
