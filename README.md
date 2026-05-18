# Connecta

AI-native travel connectivity planner for estimating mobile data needs, comparing connectivity plans, and generating observable setup guidance for trips.

Connecta is built as a Saily-aligned full-stack portfolio project using Next.js, TypeScript, Tailwind CSS, Go, GraphQL, Supabase Postgres, and Docker.

## Product Direction

Connecta helps travelers:

- Estimate mobile data usage before travel.
- Compare eSIM/connectivity options by price, validity, allowance, and safety margin.
- Generate personalized setup guidance.
- Review an agent execution trace for each recommendation.
- Save trip history and improve future recommendations with feedback.

The app is not a Saily clone. It is a connectivity decision engine with AI-native orchestration and observability.

## Phase 2 Current State

The current vertical slice includes:

- Monorepo layout.
- Next.js trip form for submitting a connectivity analysis request.
- Go GraphQL API wired with gqlgen.
- `analyzeTrip` mutation backed by service-layer orchestration.
- Deterministic usage estimation in the agents layer.
- Mock plan optimization against static in-repo plans.
- Recommendation result rendering with selected plan, alternatives, usage breakdown, connectivity guide, and agent trace.
- In-memory Phase 2 trip storage for the current backend process.
- Supabase relational schema.
- Agent and service package boundaries.

Phase 2 intentionally does not include Groq calls, Redis, dashboards, regenerate modes, advanced UI, or history persistence.

## Repository Layout

```text
connecta/
  frontend/      Next.js App Router application
  backend/       Go GraphQL API and agent/service layers
  supabase/      Postgres schema
  docs/          Architecture and API notes
```

## Local Development

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
go run ./cmd/server
```

Local services:

```bash
docker compose up -d
```

Local services are scaffolded for later phases and are not required for the Phase 2 in-memory GraphQL flow.

## Environment

Copy `.env.example` and set the required values for your local environment. Do not commit secrets.

## Build Strategy

The current polished vertical flow is:

Trip form -> backend mutation -> usage estimate -> recommendation -> result UI -> saved trip.

The project should grow vertically from that path before adding broader dashboard, history, analytics, and deployment polish.
