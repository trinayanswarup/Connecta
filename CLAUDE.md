# Connecta — Claude Code Guide

## What This Product Is

Connecta is a premium consumer travel eSIM planner. Travelers enter their destination, dates, and usage habits and get a personalised eSIM plan recommendation with alternatives, a data estimate, and a practical setup guide.

The product has two input modes:

- **Form planner** — structured inputs for destination, dates, and usage levels
- **Natural language chat agent** — user types freely ("Going to Japan 20 June to 5 July, I work remotely and use Maps constantly") and the AI parses intent, extracts structured inputs, calls the same backend, and returns a recommendation

Both modes feed the same Go GraphQL backend. The AI never overrides the deterministic recommendation engine — it only enhances explanations and parses natural language input.

The product should feel like a real travel connectivity company (think Holafly, Saily, Airalo) — not a developer tool, dashboard, or AI demo.

---

## Repo Structure

```
connecta/
├── CLAUDE.md                          ← this file
├── AGENTS.md                          ← product and visual principles
├── docs/
│   ├── PRD.md                         ← full product requirements
│   ├── architecture.md
│   ├── agent-flow.md
│   └── api-contract.md
├── backend/
│   ├── cmd/server/main.go             ← entry point, wires all dependencies
│   ├── graph/
│   │   ├── schema.graphqls            ← GraphQL schema (source of truth)
│   │   ├── schema.resolvers.go        ← thin resolvers, delegate to services
│   │   └── generated/generated.go     ← DO NOT edit, run gqlgen to regenerate
│   ├── agents/
│   │   ├── plan_optimizer.go          ← deterministic plan selection
│   │   ├── usage_estimator.go         ← deterministic GB estimation
│   │   ├── recommendation_enhancer.go ← interface for Groq enhancement
│   │   └── trace.go                   ← AgentStep types
│   ├── internal/
│   │   ├── config/config.go           ← loads env vars
│   │   ├── domain/domain.go           ← all domain types
│   │   ├── groq/client.go             ← Groq HTTP client + prompt
│   │   ├── plans/mock_plans.go        ← mock plan data (replace with real)
│   │   └── db/postgres.go             ← Postgres connection (stub)
│   ├── repositories/
│   │   └── trip_repository.go         ← in-memory repo (replace with Supabase)
│   └── services/
│       └── trip_service.go            ← orchestrates estimator → optimizer → Groq
├── frontend/
│   ├── app/
│   │   ├── page.tsx                   ← homepage
│   │   ├── trip/new/page.tsx          ← planner form
│   │   ├── esim/[destination]/page.tsx← destination detail
│   │   ├── checkout/page.tsx          ← checkout
│   │   ├── history/page.tsx           ← trip history (stub)
│   │   └── dashboard/page.tsx         ← stub
│   ├── components/
│   │   ├── TripForm.tsx               ← main planner form
│   │   ├── PlannerExperience.tsx      ← planner page wrapper
│   │   ├── RecommendationCard.tsx     ← result display
│   │   ├── AgentStepsTrace.tsx        ← collapsible agent step panel
│   │   ├── CountryPlanSelector.tsx
│   │   ├── DestinationDirectory.tsx
│   │   ├── HomeSearch.tsx
│   │   └── ConnectivityGuide.tsx
│   └── lib/
│       ├── graphql.ts                 ← typed GraphQL calls
│       ├── destination-catalog.ts     ← all destination/plan catalog data
│       └── analytics.ts              ← PostHog wrapper
└── supabase/
    └── schema.sql                     ← full Postgres schema, ready to apply
```

---

## Tech Stack

| Layer         | Technology                                                             |
| ------------- | ---------------------------------------------------------------------- |
| Frontend      | Next.js 14 (App Router), TypeScript strict, Tailwind CSS, Lucide icons |
| Backend       | Go 1.22, GraphQL via gqlgen                                            |
| AI            | Groq API — `llama-3.3-70b-versatile` (free, no card)                   |
| Database      | Supabase (Postgres) — schema at `supabase/schema.sql`                  |
| Deployment    | Vercel (frontend), Railway (backend)                                   |
| Observability | PostHog (2 events minimum: search, recommendation)                     |
| Tests         | Go test, Vitest (frontend unit), Playwright (E2E)                      |
| CI/CD         | GitHub Actions                                                         |

---

## Environment Variables

```bash
# frontend/.env.local
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# backend/.env
PORT=8080
ENVIRONMENT=development
DATABASE_URL=                          # Supabase postgres connection string
GROQ_API_KEY=                          # get free at console.groq.com
GROQ_MODEL=llama-3.3-70b-versatile
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Groq is optional — if `GROQ_API_KEY` is empty the system uses the deterministic fallback automatically. Never crashes without it.

---

## How the Backend Works

**Request flow:**

```
Frontend → GraphQL analyzeTrip mutation
  → TripService.AnalyzeTrip()
    → UsageEstimator.Estimate()         (deterministic, always runs)
    → PlanOptimizer.Optimize()          (deterministic, always runs)
    → recommendationText()              (deterministic fallback text)
    → GroqClient.EnhanceTripRecommendation()  (optional, enhances text only)
  → TripRepository.SaveAnalysis()       (currently in-memory, needs Supabase)
  → returns TripAnalysis with AgentSteps
```

**Critical rule:** Groq never selects or changes the plan. The deterministic engine picks the plan. Groq only rewrites the recommendation text and connectivity guide into better natural language.

**AgentSteps** — every stage of the pipeline emits a step with name, status, durationMs, inputSummary, outputSummary. These are returned to the frontend and displayed in the collapsible `AgentStepsTrace` component.

---

## What Is Built vs What Needs Building

### ✅ Done

- Go GraphQL backend with `analyzeTrip` mutation
- Deterministic usage estimator and plan optimizer
- Groq client — wired, fallback-safe, just needs a real API key
- Full Supabase schema (`supabase/schema.sql`)
- Frontend pages: homepage, planner, recommendation, destination, checkout
- AgentStepsTrace component (collapsible)
- Destination catalog with global/regional/country entries
- AGENTS.md visual and product principles
- Docker Compose scaffold

### 🔨 Needs Building (in priority order)

1. **UI polish** — homepage and planner to Saily/Holafly level. See design rules below.
2. **Natural language chat agent** — new input mode on the planner page. See spec below.
3. **Real plan data** — replace `mock_plans.go` with real Airalo/Holafly plan data per destination.
4. **Agent steps panel** — make `AgentStepsTrace` visible and well-designed in the recommendation results.
5. **Groq smoke test** — add `GROQ_API_KEY` to `.env`, confirm enhancement fires, check output quality.
6. **Supabase persistence** — wire `trip_repository.go` to Supabase instead of in-memory.
7. **Trip history page** — pull saved trips from Supabase, display at `/history`.
8. **PostHog** — track `destination_searched` and `recommendation_viewed` events.
9. **Tests** — Go unit tests for estimator and optimizer, Vitest for frontend components, one Playwright E2E for full planner flow.
10. **CI/CD** — GitHub Actions: typecheck + lint + go test + vitest on every push.
11. **Docker Compose** — make `docker-compose.yml` fully functional for local dev.
12. **Deploy** — Vercel (frontend) + Railway (backend). Live URL required.
13. **README** — live URL, architecture diagram, what the AI does, how to run locally.

---

## Natural Language Chat Agent — Spec

This is the most important new feature. It must be built as a true agent, not a chatbot wrapper.

**What it does:**
User types: _"I'm going to Japan from June 20 to July 5. I work remotely and use Maps constantly."_
The system:

1. Sends the message to Groq with a structured extraction prompt
2. Groq returns a JSON object matching `TripInput` fields
3. The frontend calls `analyzeTrip` with the extracted inputs
4. The recommendation is displayed in the chat interface
5. The user sees the agent steps in a collapsible panel

**GraphQL mutation to call:** `analyzeTrip` — same as the form. No new backend endpoint needed.

**New frontend API route:** `app/api/chat/route.ts`

- Receives: `{ message: string, history: ChatMessage[] }`
- Calls Groq to extract `TripInput` from the message
- Returns: `{ extracted: TripInput | null, clarification: string | null }`
- If extraction is incomplete (e.g. no dates), returns a clarification question instead

**Groq extraction prompt must return JSON:**

```json
{
  "destination": "Japan",
  "startDate": "2026-06-20",
  "endDate": "2026-07-05",
  "travelerType": "BUSINESS",
  "usage": {
    "maps": "HEAVY",
    "work": "HEAVY",
    "streaming": "LIGHT",
    "socialMedia": "MODERATE",
    "videoCalls": "MODERATE",
    "hotspot": "HEAVY"
  }
}
```

**UI placement:** Tab switcher on the planner page — "Plan my trip" (form) | "Chat with AI" (chat input). Not a separate page.

**Consumer language only.** Never say "GraphQL", "agent", "mutation", "Groq", or "LLM" in the UI.

---

## Design Rules (Non-Negotiable)

Reference brands: Saily, Holafly, Airalo — clean, premium, travel-first.

**Palette:**

- Base: white / ivory `#FAFAF8`
- Section bands: soft mint `#F0FDF4`, pale blue `#EFF6FF`, warm peach `#FFF7ED`
- Text: deep navy `#0F172A`
- Primary accent: teal `#0D9488`
- Secondary: blue `#3B82F6`, coral `#F97316`

**Typography:** Strong headings, generous line height, readable body text. Not monospace, not technical.

**Cards:** Rounded (`rounded-2xl`), subtle shadow (`shadow-sm`), white background, generous padding.

**Spacing:** Generous. Sections breathe. No cramped layouts.

**Never use:**

- Dark mode / dark panels
- SaaS dashboard grid layouts
- Engineering terminology in any customer-facing text
- "agent", "GraphQL", "mutation", "AI model", "LLM", "Groq" visible to users
- Dense bordered form blocks

---

## Backend Development Rules

- Run `go test ./...` after any backend change
- Run `gofmt` on edited Go files
- Keep resolvers thin — business logic belongs in services
- Validate all Groq JSON responses before using
- Never hardcode secrets — always read from config/env
- After editing `schema.graphqls`, run `go run github.com/99designs/gqlgen generate`

## Frontend Development Rules

- Run `npm run typecheck` after any frontend change
- Run ESLint on changed files
- TypeScript strict mode — no `any` unless absolutely necessary
- Use Lucide for all icons
- Components stay small and composable
- No visible engineering language in customer-facing UI
- Browser verify homepage and planner after any major change

---

## Running Locally

```bash
# Backend
cd backend
go run ./cmd/server

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Backend runs on `:8080`, frontend on `:3000`.

GraphQL playground: `http://localhost:8080/graphql`

---

## Test the Groq Integration

1. Get a free API key at `console.groq.com` (no card required)
2. Add to `backend/.env`: `GROQ_API_KEY=gsk_xxxx`
3. Change model to: `GROQ_MODEL=llama-3.3-70b-versatile`
4. Run backend, submit a trip via the planner
5. Check that `AgentSteps` includes "AI guide generation" with status `COMPLETED`
6. Check that the recommendation text is richer than the deterministic fallback

---

## Key Decisions (Do Not Reverse)

- **Groq never picks the plan.** The deterministic engine always picks. Groq only writes better text.
- **No auth for MVP.** Anonymous session-based trip history is enough.
- **No Kubernetes, Kafka, Terraform, or microservices** for this project.
- **One polished vertical flow** before adding surface area.
- **Mock plans must be replaced** with real data before deployment.
