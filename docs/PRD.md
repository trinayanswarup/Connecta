# Connecta — Product Requirements Document

## Product Summary

Connecta is a premium consumer travel eSIM planner. Travelers describe their trip — destination, dates, and how they use their phone — and Connecta recommends the right eSIM plan, explains the reasoning, and gives a practical setup guide.

The product has two input modes:

- **Form planner** — structured destination, date, and usage inputs
- **Natural language chat agent** — user types freely and an AI agent parses intent, extracts structured inputs, and calls the same recommendation engine

Both modes are powered by the same Go GraphQL backend. The AI enhances the experience but never overrides the deterministic recommendation engine.

Connecta is also the backend for a second, independent client: **SailGuard**, a native Kotlin/Jetpack Compose Android app in its own repository. Both clients read and write the same `trips`/`usage_snapshots` tables through the same GraphQL contract, keyed by a shared session ID. A purchase confirmed on one client is visible on the other; real device usage tracked on SailGuard shows up as a live chart on Connecta's web trip page. This is a real, working integration, not a planned one.

Connecta should feel like a real premium travel connectivity brand — calm, clean, trustworthy — not a developer tool or AI demo. Visual references: Saily, Holafly, Airalo.

---

## Problem

Travelers face confusing mobile connectivity choices:

- Roaming is expensive and unpredictable
- Airport SIM counters add friction after arrival
- Plan sizes, validity windows, and country coverage are hard to compare
- Setup instructions are unclear until you're already abroad
- Most comparison flows are too technical or cluttered

Connecta solves this by turning trip details and usage habits into a clear eSIM recommendation, with alternatives and a step-by-step setup guide — and, once purchased, keeps that decision visible and trackable across whichever device the traveler actually uses.

---

## Target Users

**Primary**

- Leisure travelers planning trips abroad
- Solo travelers and couples who need data for maps, messaging, and social apps
- Remote workers and business travelers who need hotspot, video calls, and reliability

**Secondary**

- Families planning shared travel connectivity
- Multi-country travelers who need regional or global plans

---

## Product Goals

1. Present Connecta as a premium consumer eSIM brand
2. Provide a destination-first, travel-emotional product flow
3. Give travelers two ways to plan: a structured form and a natural language chat agent
4. Make the AI reasoning visible but collapsible — not the focus
5. Persist trip history to Supabase, and make a confirmed purchase a real, durable fact — not a UI-only state
6. Keep a second client (SailGuard) and the web client in sync through one shared backend, without either client depending on the other's internals
7. Deploy with a live URL close to when it's actually needed for an application — not maintained as a standing cost between applications

---

## Non-Goals

- No user authentication for MVP (anonymous session-based history is enough, and is also the mechanism that links the web session to SailGuard)
- No Kubernetes, Kafka, Terraform, or microservices
- No copying of Holafly, Airalo, or Saily code, branding, or assets
- No engineering/AI terminology visible to users ("GraphQL", "Groq", "agent", "mutation", "LLM")
- No replacing the deterministic backend recommendation engine with AI
- No real payment processor — checkout confirms a purchase (real, persisted) but doesn't move real money

---

## Complete Feature Set

### 1. Homepage

A premium travel-focused landing page. Not a SaaS dashboard.

**Hero section**

- Strong travel headline (e.g. "Stay connected anywhere in the world")
- Short support copy about no roaming, no plastic SIMs
- Primary CTA: "Find my plan" → `/trip/new`
- Secondary CTA: "Browse destinations" → scrolls to destination directory

**Compact planner strip, popular destinations, destination directory, static plan cards, eSIM explainer, how-it-works, trust/benefits, final CTA** — as originally specced; unchanged.

---

### 2. Planner Page — Form Mode

**URL:** `/trip/new`

Destination, dates, usage levels per activity (Maps, Streaming, Social media, Video calls, Hotspot, Work — each None/Light/Moderate/Heavy), optional budget. Query params prefill from links elsewhere in the app. Submission calls `analyzeTrip` and renders results below the form.

---

### 3. Planner Page — Chat Agent Mode

Tab switcher: "Plan my trip" (form) | "Ask AI" (chat). User types a free-form description, `app/api/chat/route.ts` sends it to Groq with a structured extraction prompt, gets back a `TripInput`-shaped JSON object (or a clarification question if incomplete), and the frontend calls the same `analyzeTrip` mutation the form uses. No separate backend path — this is a different way to fill out the same input, not a different feature.

Consumer language only. Never display "GraphQL", "Groq", "agent", "mutation", or "LLM".

---

### 4. Recommendation Results

Best-match card (plan, AI-enhanced explanation, "Select this plan" CTA), 2-3 alternatives, usage breakdown, setup guide, and a collapsible "How Connecta decided this" agent-steps panel — as originally specced, all real and wired.

---

### 5. Destination Pages

`/esim/[destination]` — destination info, illustrative plan sizes, CTA into the planner. Unchanged.

---

### 6. Checkout — real, not a placeholder

**URL:** `/checkout`

Summary of the selected plan (data, validity, price), trust points, a payment-info form (card/Google Pay/PayPal selector — no real payment processor behind it), and a "Pay" action that calls the `confirmTrip` mutation. On success, the trip is marked confirmed in Postgres — `confirmed_at` and `confirmed_plan` are real, durable fields, not client-side state. On failure (e.g. backend unreachable), the user sees an actual error, not a faked success screen. This used to be a 1.5-second `setTimeout` with no backend call at all; if that pattern reappears anywhere, treat it as a regression.

`confirmTrip` accepts an optional `tripId`. When present (the normal web flow — a trip already exists from `analyzeTrip`), it confirms that trip in place. When absent, it creates a new trip and confirms it in the same step — this is the path SailGuard uses, since it has its own plan-recommendation logic and never calls `analyzeTrip`.

---

### 7. Trip History

**URL:** `/history`

List of past trips, each showing destination, dates, and one of three distinct states — these are not interchangeable, each means something different and all three are real:

- **Recommended** (orange) — what `analyzeTrip` suggested; never purchased
- **Confirmed** (emerald) — actually purchased through this web checkout
- **Confirmed via [Provider]** (emerald, provider-labeled) — purchased through a different client on the same session — in practice, SailGuard — surfaced via the `tripsBySession` query

Confirmed trips link to the trip detail page ("View live usage").

---

### 8. Trip Detail Page — new since the SailGuard integration

**URL:** `/trip/[id]`

Trip header, confirmed plan card, and a live usage section: stat tiles (data used, battery %, network type from the most recent reading) and an area chart of cumulative data usage over time, sourced from the `usage_snapshots` table. This data is written by SailGuard roughly every 30 seconds while a trip is active on a real device — reading actual `TrafficStats` byte counters, not simulated. The page polls every 30 seconds itself to stay current while open. If a trip has no snapshots yet (most commonly: it was only ever confirmed via the web, never run through SailGuard), the empty state explains that plainly rather than looking broken.

---

## Cross-App Integration (SailGuard)

This is now a core part of the product, not a future item.

**Identity model:** a session ID — a UUID generated client-side, stored in `localStorage` on web — is the entire identity system. There's no auth. The same UUID, pasted once into SailGuard as a "link code," is what lets both clients agree they're looking at the same person's trips. Whoever has the UUID can read/write that session's data; this is an accepted, explicit tradeoff of the anonymous-session model, not an oversight.

**Shared surface (`schema.graphqls`):**
- `confirmTrip(input: ConfirmTripInput!): Trip!` — see Checkout above for the dual-path design
- `submitUsageSnapshot(input: SubmitUsageSnapshotInput!): UsageSnapshot!` — SailGuard's 30-second usage push
- `tripsBySession(sessionId: String!): [Trip!]!` — both clients use this to show "what's confirmed for this session," including trips the other client created
- `tripUsage(tripId: ID!): [UsageSnapshot!]!` — backs the live usage chart

**What SailGuard does on its own:** has its own destination/usage/plan wizard, its own (now Connecta-aligned) plan catalog, its own local Room-backed trip history, its own real-device usage tracking. None of that depends on Connecta's backend being reachable — SailGuard works fully standalone with no link code set. The integration is additive, not a hard dependency.

**What this proves, as an engineering exercise:** the harder, more interesting work here wasn't building either app — it was the seam between them. Confirming a trip without an existing `tripId`, deciding which fields the upsert touches vs. leaves alone on conflict, RLS policies that needed to cover an anon-key read path the original schema didn't anticipate, a real cleartext-traffic Android networking bug, a real gqlgen resolver-file mangling bug — these were all genuine integration problems with genuine fixes, not hypothetical edge cases.

---

## AI Architecture

### Groq — Recommendation Enhancement

**When:** After the deterministic engine picks a plan.
**What it does:** Rewrites the recommendation text and connectivity guide in better natural language.
**What it never does:** Changes the selected plan, price, data amount, or estimate.
**Fallback:** If `GROQ_API_KEY` is empty or Groq fails, the deterministic text is used. The app never breaks.
**Model:** `llama-3.3-70b-versatile`

### Groq — Natural Language Extraction (Chat Agent)

**When:** User submits a message in chat mode.
**What it does:** Extracts `TripInput` fields from free-form text.
**Output:** Structured JSON matching the `TripInput` GraphQL type.
**Fallback:** If extraction is incomplete, returns a clarification question.
**Model:** `llama-3.3-70b-versatile`

---

## Backend Architecture

```
analyzeTrip mutation
  → TripService.AnalyzeTrip()
    → UsageEstimator.Estimate()          deterministic
    → PlanOptimizer.Optimize()           deterministic
    → recommendationText()               deterministic fallback
    → GroqClient.EnhanceTripRecommendation()   optional
  → TripRepository.SaveAnalysis()        Postgres upsert
  → returns TripAnalysis + AgentSteps

confirmTrip mutation
  → existing tripId?  GetAnalysis → mutate ConfirmedAt/ConfirmedPlan → SaveAnalysis (same upsert)
  → no tripId?        construct a new TripAnalysis → SaveAnalysis (same upsert, fresh insert)
  → returns the confirmed Trip, visible to both web and SailGuard via tripsBySession
```

**GraphQL schema:** `backend/graph/schema.graphqls` — source of truth, and the actual contract SailGuard depends on.
**Domain types:** `backend/internal/domain/domain.go`
**Supabase schema:** `supabase/schema.sql` — includes the original schema plus an additive SailGuard-integration migration block (new columns, `usage_snapshots` table, anon-read RLS policies).

---

## Design System

**Palette** — what's actually shipped, not the original exploratory palette:

| Token | Value |
|---|---|
| Base | `#FAFAF8` (ivory white) |
| Text primary | `slate-950` (`#020617`) |
| Text secondary | `slate-500` (`#64748B`) |
| Border | `slate-200` (`#E2E8F0`) |
| Accent (CTAs, links, badges) | orange-600 (`#EA580C`), hover orange-700 (`#C2410C`) |
| Confirmed/success state | emerald-600 (`#059669`) |

**Components:** cards `rounded-2xl`, `shadow-sm`, white background. Buttons `rounded-full` for primary CTAs. Inputs `rounded-xl`. Section spacing `py-20`/`py-24`.

**Typography:** bold large headings in navy/near-black, readable body text, generous line height. No monospace in consumer UI.

**Never use:** dark backgrounds in main content areas, dense form cards with heavy borders, engineering/AI terminology in consumer copy, decorative clutter.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 App Router, TypeScript strict, Tailwind CSS, Lucide icons, recharts |
| Backend | Go, GraphQL (gqlgen — requires Go ≥1.25) |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Database | Supabase (Postgres) |
| Mobile companion | SailGuard — Kotlin, Jetpack Compose, separate repo, shares this backend |
| Deployment (planned) | Vercel (frontend), Railway (backend) — not yet deployed, deliberately |

---

## What's Actually Done vs. Genuinely Still Open

### Done
- Form + chat planner, both calling the real `analyzeTrip` flow
- Groq enhancement with deterministic fallback
- Real checkout (`confirmTrip`), real history badges (Recommended/Confirmed/Synced), real trip detail page with live usage chart
- Full SailGuard integration — link code, dual-path `confirmTrip`, usage sync, tested end to end on physical Android hardware

### Genuinely still open
- Real plan data — `mock_plans.go` is a flat, illustrative global catalog, not a real provider's actual eSIM pricing
- Deployment — Vercel + Railway, intentionally not done until needed for an actual application
- PostHog analytics events, Playwright E2E coverage, CI/CD beyond what already runs on PRs — not yet built; don't assume these exist just because they were planned

---

## Success Criteria

- Homepage looks and feels like a premium travel connectivity product
- Chat agent correctly extracts trip intent and returns a recommendation
- Groq enhancement is visible in the recommendation text and setup guide
- Checkout produces a real, persisted confirmed purchase
- A trip confirmed on SailGuard shows up in Connecta's web history, and vice versa
- Real device usage tracked on SailGuard renders as a live chart on the web trip page
- TypeScript strict passes with zero errors; Go tests pass
- Live URL exists and the full flow works end to end — at the point this is actually needed for an application, not before

---

## Future (Post-MVP)

- Real eSIM provider API integration (e.g. Airalo)
- Device compatibility checker
- Multi-country itinerary builder
- Currency localisation
- User accounts and real order history
- Plan price alerts
- Partner/affiliate links
