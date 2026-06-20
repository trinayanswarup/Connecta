# Connecta — Development Guide

## Running locally

```bash
# Backend
cd backend && go run ./cmd/server

# Frontend
cd frontend && npm install && npm run dev
```

## Tech stack

- **Frontend** — Next.js 15, TypeScript, Tailwind CSS
- **Backend** — Go, GraphQL via gqlgen (requires Go ≥1.25)
- **AI** — Groq `llama-3.3-70b-versatile`, enhancement only — never picks the plan
- **Database** — Supabase Postgres

## Key rules

- Business logic lives in `services/` only — resolvers are thin mappers
- After editing `schema.graphqls`, run `go run github.com/99designs/gqlgen generate` then `go build ./...`
- Groq is optional — the product works without it via deterministic fallback
- Run `go test ./...` after backend changes
- Run `npx tsc --noEmit` and `npm run build` after frontend changes
- `gofmt` every Go file before committing

## Environment variables

```bash
# backend/.env
DATABASE_URL=          # Supabase connection string
GROQ_API_KEY=          # optional
GROQ_MODEL=llama-3.3-70b-versatile

# frontend/.env.local
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
```

## Architecture in one paragraph

`analyzeTrip` → `UsageEstimator` (deterministic) → `PlanOptimizer` (deterministic) → `GroqEnhancer` (optional text rewrite) → `TripRepository.SaveAnalysis` (Postgres upsert). `confirmTrip` reuses the same upsert path — fetch, mutate `confirmed_at`/`confirmed_plan`, save. Both the web frontend and the Android companion app (separate repo: SailGuard) call this same GraphQL API. Don't change `confirmTrip`, `submitUsageSnapshot`, `tripsBySession`, or `tripUsage` without checking the Android client.
