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

## Phase 3 Current State

The current vertical slice includes:

- Monorepo layout.
- Next.js trip form for submitting a connectivity analysis request.
- Go GraphQL API wired with gqlgen.
- `analyzeTrip` mutation backed by service-layer orchestration.
- Deterministic usage estimation in the agents layer as the usage source of truth.
- Mock plan optimization against static in-repo plans as the plan source of truth.
- Optional Groq enhancement for recommendation reasoning and connectivity guide text when `GROQ_API_KEY` is configured.
- Structured AI JSON parsing with deterministic fallback when Groq is unavailable, returns invalid JSON, or omits required guide sections.
- Recommendation result rendering with selected plan, alternatives, usage breakdown, connectivity guide, and agent trace.
- In-memory Phase 3 trip storage for the current backend process.
- Supabase relational schema.
- Agent and service package boundaries.

Phase 3 intentionally does not include auth, Redis, dashboards, regenerate modes, advanced UI, or history persistence.

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

Local services are scaffolded for later phases and are not required for the Phase 3 in-memory GraphQL flow.

## Environment

Copy `.env.example` and set the required values for your local environment. Do not commit secrets.

`GROQ_API_KEY` is optional. When it is empty, the backend keeps using deterministic recommendation text and guide output.

## Build Strategy

The current polished vertical flow is:

Trip form -> backend mutation -> deterministic usage estimate -> deterministic plan choice -> optional AI text enhancement -> result UI -> saved trip.

The project should grow vertically from that path before adding broader dashboard, history, analytics, and deployment polish.
