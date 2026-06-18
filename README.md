# Connecta

A travel eSIM planner that recommends a data plan from real usage inputs, and a Go/GraphQL backend that the same product's native Android companion app (SailGuard) reads and writes to as well — one shared backend, two real clients, one consistent state.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Go · GraphQL (gqlgen) · Supabase (Postgres) · Groq (LLM)

---

## What this actually is

Connecta is a web app where a traveler describes a trip — destination, dates, how they'll use data — and gets a specific plan recommendation with a price, a data estimate, and a written setup guide. It's also the web half of a two-app system: the same backend serves a native Android app (**[SailGuard](https://github.com/trinayanswarup/SailGuard)**) over the same GraphQL API, so a purchase made on the website shows up in the app, usage tracked live on a phone shows up on the website, and both are reading and writing the same Postgres rows.

That second part is the more interesting engineering story here. Most portfolio projects are a single app talking to its own backend. This is one backend serving two genuinely different clients — a Next.js frontend and a Kotlin/Jetpack Compose Android app — built independently, integrated deliberately, with a shared GraphQL contract as the seam between them.

## Architecture

```
                    ┌─────────────────────┐
                    │   Go GraphQL API     │
                    │  (gqlgen, Postgres)  │
                    └──────────┬───────────┘
                  confirmTrip / submitUsageSnapshot
                  tripsBySession / tripUsage
              ┌──────────────┴──────────────┐
              │                             │
   ┌──────────▼──────────┐       ┌──────────▼──────────┐
   │   Connecta (web)     │       │  SailGuard (Android) │
   │   Next.js + Groq      │       │  Kotlin + Compose     │
   └──────────────────────┘       └──────────────────────┘
```

A trip's identity is a session ID — a UUID generated client-side and stored in `localStorage` on web, pasted once into SailGuard as a "link code." Whichever client confirms a purchase, the row lands in the same `trips` table under that same session ID, so either client can read it back.

**The actual recommendation flow:**
```
Trip form (or chat) → analyzeTrip mutation
  → UsageEstimator (deterministic GB estimate, always runs)
  → PlanOptimizer (deterministic plan choice, always runs)
  → Groq (optional — rewrites the explanation/guide text only)
  → result: selected plan, alternatives, usage breakdown, connectivity guide
```
Groq never picks the plan. The deterministic engine always does. Groq's only job is making the explanation read like a person wrote it, with a deterministic fallback if the API key isn't set or the response is malformed — the product never breaks because an LLM call failed.

**The purchase/sync flow** (the part shared with SailGuard):
```
checkout (web) or trip start (SailGuard)
  → confirmTrip mutation
    → existing trip?  mark it confirmed, leave everything else untouched
    → no existing trip?  create + confirm one in the same step
                          (this is the path SailGuard uses — it has its
                          own plan-recommendation logic and never calls
                          analyzeTrip at all)
  → row visible to both clients via tripsBySession
```
SailGuard also pushes a `submitUsageSnapshot` every 30 seconds while a trip is active, reading real device data usage off `TrafficStats` — not simulated. That shows up as a live chart on the trip's detail page on the web.

## What's real vs. what's a deliberate placeholder

**Real:** the GraphQL backend, the deterministic recommendation engine, Groq enhancement with fallback, Supabase persistence, session-based history (no auth needed), the full checkout→confirm flow, the SailGuard integration end to end (tested on physical hardware, not an emulator), live usage charting.

**Deliberate placeholder:** the plan catalog (`backend/internal/plans/mock_plans.go`) is a flat, illustrative price list, not a real carrier's actual eSIM pricing — swapping it for a real provider's API is the obvious next step, and the architecture doesn't need to change to do it.

**Not done, on purpose:** nothing is deployed yet. This runs locally end to end (`go run ./cmd/server` + `npm run dev`), and deployment (Vercel + Railway, both free tier) happens close to when it's actually needed for an application, not as a standing cost.

## Repository layout

```
connecta/
  backend/
    cmd/server/         entry point, wires everything
    graph/               schema.graphqls (source of truth), resolvers, generated code
    agents/               deterministic usage estimator + plan optimizer
    internal/groq/        Groq client, fallback-safe
    internal/plans/       mock plan catalog
    repositories/         Postgres (and in-memory fallback) persistence
    services/              orchestration layer — the one place business logic lives
  frontend/
    app/                  Next.js App Router pages (planner, checkout, history, trip/[id])
    components/           TripForm, CheckoutForm, TripDetail (live usage chart), etc.
    lib/                  graphql.ts (typed calls), supabase.ts (direct anon reads)
  supabase/
    schema.sql            full Postgres schema, including the SailGuard-integration migration
```

## Running it locally

```bash
# backend
cd backend
go run ./cmd/server          # :8080, GraphQL playground at /graphql

# frontend, separate terminal
cd frontend
npm install
npm run dev                  # :3000
```

Copy `.env.example` in each directory and fill in your own Supabase project + (optional) Groq key. Without `GROQ_API_KEY` set, recommendations still work — they just use the deterministic fallback text instead of Groq's rewrite.

## Why it's built this way

Free-tier only, deliberately: Groq, Supabase, Vercel, Railway — no paid API, no recurring cost sitting around between applications. The AI is structurally incapable of breaking the product (deterministic engine first, LLM enhancement second, fallback always available) rather than the product being an AI wrapper that happens to also pick plans.

This was built AI-native — Claude Code as the primary build tool, with `CLAUDE.md` and `AGENTS.md` in this repo as the actual working instructions used during development, not retrofitted documentation. They're included as-is because they're an honest artifact of how this was built, not because every reader needs them.
