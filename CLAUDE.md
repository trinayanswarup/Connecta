# Connecta — Claude Code Guide

## What this product actually is, right now

Connecta is a travel eSIM planner (Next.js + Go/GraphQL + Supabase) **and** the backend for a second, separate client: SailGuard, a native Kotlin/Compose Android app in its own repo. The same `confirmTrip` / `submitUsageSnapshot` / `tripsBySession` / `tripUsage` GraphQL surface serves both. Do not treat this as "the web app, plus an unrelated mobile app exists somewhere" — the integration is load-bearing. Changes to `schema.graphqls`, `domain.go`, or the `trips`/`usage_snapshots` tables affect both clients, even though SailGuard lives in a different repo and you likely won't have it open at the same time.

Two input modes feed the same backend: a structured form (`TripForm.tsx`) and a natural-language chat agent (`app/api/chat/route.ts` parses free text into the same `TripInput` shape via Groq, then calls the same `analyzeTrip` mutation). Both are real, both are wired, neither is a stub.

Checkout is real — it calls `confirmTrip` and actually persists a confirmed purchase. It used to be a fake 1.5-second delay; if you find code that looks like that anywhere, it's a regression, not the intended design.

## Repo structure

```
connecta/
├── CLAUDE.md                          ← this file
├── AGENTS.md                          ← product/visual principles
├── docs/PRD.md                        ← full product requirements
├── backend/
│   ├── cmd/server/main.go             ← entry point, wires trip + usage repos
│   ├── graph/
│   │   ├── schema.graphqls            ← source of truth — edit this first
│   │   ├── schema.resolvers.go        ← thin resolvers + toGraph*/toDomain* mapping helpers
│   │   └── generated/, models/        ← gqlgen output, DO NOT hand-edit
│   ├── agents/                        ← deterministic usage estimator + plan optimizer
│   ├── internal/
│   │   ├── domain/domain.go           ← all domain types, including ConfirmedPlan/UsageSnapshot
│   │   ├── groq/client.go             ← Groq client, fallback-safe
│   │   ├── plans/mock_plans.go        ← the plan catalog SailGuard also mirrors — keep them aligned if you change this
│   │   └── db/postgres.go             ← pgx connection setup
│   ├── repositories/
│   │   ├── trip_repository.go         ← Postgres + in-memory fallback; SaveAnalysis is a single upsert path used by both analyzeTrip and confirmTrip
│   │   └── usage_snapshot_repository.go
│   └── services/trip_service.go       ← all orchestration logic lives here, not in resolvers
├── frontend/
│   ├── app/
│   │   ├── trip/new/page.tsx          ← planner form
│   │   ├── checkout/page.tsx          ← real checkout, calls confirmTrip
│   │   ├── history/page.tsx           ← Recommended / Confirmed / Synced-from-X badges
│   │   └── trip/[id]/page.tsx         ← live usage chart, reads usage_snapshots
│   ├── components/TripDetail.tsx      ← the live usage chart (recharts), polls every 30s
│   └── lib/
│       ├── graphql.ts                 ← typed mutation/query calls
│       └── supabase.ts                ← direct anon-key reads (trips, usage_snapshots)
└── supabase/schema.sql                ← full schema including the SailGuard-integration migration at the bottom
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript strict, Tailwind, Lucide icons, recharts |
| Backend | Go, GraphQL via gqlgen (**requires Go ≥1.25** — see gotcha below) |
| AI | Groq, `llama-3.3-70b-versatile` — enhances text only, never picks plans |
| Database | Supabase Postgres |
| Mobile companion | SailGuard (separate repo, Kotlin/Compose) — talks to this backend over plain HTTP in dev |

## A real, recurring gotcha: gqlgen needs Go ≥1.25

If you add a new GraphQL field, `go run github.com/99designs/gqlgen generate` followed by `go build ./...` is mandatory — hand-editing `generated.go`/`models_gen.go` is not viable, they're fully regenerated. This has actually broken once already: gqlgen's "follow-schema" resolver rewrite can silently drop hand-written helper functions (`toGraphTrip`, etc.) from `schema.resolvers.go` if validation fails partway through. If a build suddenly reports a wall of `undefined: toGraph...` errors after running `gqlgen generate`, that's almost certainly what happened — the fix is restoring the full resolver file, not chasing each missing symbol individually.

## RLS has drifted from `schema.sql` — know this before debugging "it works for the user but not for me"

The frontend reads `trips` and `usage_snapshots` via the Supabase anon key (`lib/supabase.ts`), filtered client-side by session ID. `schema.sql`'s original policies only covered the `authenticated` role. The live database has anon-read policies that were added directly via the Supabase SQL editor at some point and are now also captured in `schema.sql`'s SailGuard-integration migration block — but if anyone re-creates the database from `schema.sql` alone going forward, run that full file, not just the original section, or anon reads will silently return nothing with no error.

## How the recommendation flow actually works

```
analyzeTrip(input) → TripService.AnalyzeTrip()
  → UsageEstimator.Estimate()         deterministic, always runs
  → PlanOptimizer.Optimize()          deterministic, always runs
  → GroqClient.Enhance...()           optional — text only, never touches the plan choice
  → TripRepository.SaveAnalysis()     upsert; same function confirmTrip reuses
  → returns TripAnalysis + AgentSteps
```

`confirmTrip` reuses `SaveAnalysis` rather than having its own write path: fetch via `GetAnalysis`, mutate `ConfirmedAt`/`ConfirmedPlan`, save again. The upsert's `ON CONFLICT DO UPDATE SET` clause deliberately omits `destination`/`dates`/`user_id` from the SET list, so confirming an existing trip can never accidentally null out fields it didn't intend to touch — don't add those columns to that SET clause without understanding why they're excluded.

## What's built vs. genuinely still open

### Done
- `analyzeTrip` (form + chat, both real), Groq enhancement with deterministic fallback
- `confirmTrip` / `submitUsageSnapshot` / `tripsBySession` / `tripUsage` — the full SailGuard-integration surface
- Checkout that actually persists a confirmation, not a simulated delay
- History page with Recommended/Confirmed/Synced-from-provider badges
- Live usage chart on the trip detail page, reading SailGuard's real device data
- Session-based history, no auth

### Genuinely still open
- Plan catalog (`mock_plans.go`) is a flat illustrative price list — swap for a real provider's data
- Deployment — not yet on Vercel/Railway; that's deliberate, not an oversight (see below)
- Natural-language chat agent works but hasn't had the same UI polish pass as the form

## Key decisions — do not reverse these without a clear reason

- **Groq never picks the plan.** Deterministic engine always does, every time.
- **No auth for MVP.** Anonymous session ID is the whole identity model, on both web and SailGuard.
- **Free tier only.** Groq, Supabase, Vercel, Railway. No paid API gets added without an explicit decision to do so.
- **Deploy close to when it's needed**, not as a standing service — this repo is meant to be demoed locally most of the time.
- **One shared GraphQL contract serves both clients.** If a change to `schema.graphqls` would break SailGuard's expectations, that's a real cost to weigh, not a free refactor — even though you can't see SailGuard's code from here.

## Working rules

- `gofmt` every changed Go file before committing — CI checks this and has failed on it before (CRLF line-ending conversion on Windows checkouts is the usual culprit).
- `go test ./...` after backend changes.
- `npx tsc --noEmit` and `npm run build` after frontend changes — don't skip the full build, `tsc` alone has missed real issues before.
- Business logic belongs in `services/`, not in resolvers. Resolvers map GraphQL ↔ domain types and call the service.
- Branch before any change that touches existing behavior, not just new additions — never commit straight to `main`.
