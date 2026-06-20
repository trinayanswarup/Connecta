# Connecta — Product Requirements

## Problem

Travelers buying a travel eSIM face three friction points:

1. **Before the trip** — no good way to estimate how much data they'll actually need based on their real usage habits. Plans are sized in GB; people think in "I stream a lot" or "I just use Maps."
2. **At purchase** — comparison sites surface raw specs (GB, days, price) with no personalization. The best-value plan for a remote worker is different from the one for a social media user on the same trip.
3. **During the trip** — the purchase lives in an email receipt. There's nothing tracking whether the plan is going to last, and no warning before it runs out.

## Solution

A planner that turns usage habits into a specific recommendation with a clear reason, plus an Android app that tracks whether that plan is actually holding up during the trip — and keeps both clients in sync through one shared backend.

## Users

- **Leisure travelers** — want a simple answer: "which plan should I buy for two weeks in Japan?"
- **Remote workers / business travelers** — need hotspot, video calls, reliability; overbuy if they don't have data to calibrate against
- **Repeat travelers** — have past trip history that should inform future recommendations

## Product flows

### 1. Planner (web)

Two equivalent input modes:

- **Form** — destination, dates, six usage sliders (streaming, video calls, hotspot, maps, social media, work), each at None/Light/Moderate/Heavy
- **Chat** — free text ("going to Thailand for two weeks in July, I work remotely") parsed by Groq into the same structured input, then run through the same engine

Output: selected plan with explanation, 2–3 alternatives with tradeoff notes, per-activity data breakdown, setup guide.

The recommendation engine is deterministic — usage estimate and plan selection are always computed the same way regardless of whether Groq is available. Groq only rewrites the explanation text into better natural language, with a deterministic fallback always ready.

### 2. Checkout (web)

Summarizes the selected plan, collects payment intent (no real processor for MVP), then calls `confirmTrip`. This writes a real, durable record to Postgres: `confirmed_at`, `confirmed_plan` (provider, name, price, data, validity). The history page shows this as a distinct "Confirmed" state — not the same as a recommendation that was never purchased.

### 3. History (web)

Three distinct states per trip, because they mean different things:

| State                        | What it means                                            |
| ---------------------------- | -------------------------------------------------------- |
| **Recommended**              | `analyzeTrip` ran, a plan was suggested, never purchased |
| **Confirmed**                | Purchased through this web checkout                      |
| **Confirmed via [Provider]** | Purchased through the Android app on the same session    |

Confirmed trips link to the trip detail page.

### 4. Trip detail / live usage (web)

Shows the confirmed plan and a recharts area chart of cumulative data usage over time, sourced from `usage_snapshots`. Data is pushed by the Android app every 30 seconds while a trip is active, reading actual cellular byte counters from `TrafficStats` — not simulated. The page polls every 30 seconds itself to stay current.

### 5. Android companion (separate repo)

A full native trip-planning app in its own right — destination/usage/plan wizard, real device tracking, local trip history. When linked (user pastes their web session ID as a "link code"), purchases and usage data sync both directions through the same Go backend.

The integration is additive. Remove the link code, and the standalone app is unaffected. Add it, and both clients are looking at the same Postgres rows.

## Non-goals (MVP)

- No user authentication — anonymous session ID is sufficient
- No real payment processing
- No real eSIM carrier API — plan catalog is illustrative
- No deployment as a standing service — deployed close to when needed, not maintained between applications

## Architecture decisions worth noting

**Why Go for the backend?** Service layer orchestration (estimator → optimizer → optional Groq → repository) is a chain of pure function calls with clear boundaries. Go's explicit error handling makes the fallback chain straightforward — every step that can fail has a defined fallback, not a catch-all exception.

**Why the same backend serves both clients?** The alternative is two backends that need to stay in sync, or one backend that knows too much about both clients. One GraphQL contract that both clients speak is simpler and creates a clear seam — the Android app doesn't need to know anything about how the web recommendation engine works, just that `confirmTrip` and `submitUsageSnapshot` exist.

**Why no auth?** The session ID model is deliberate, not a shortcut. Requiring login to plan a trip adds friction at the exact moment a user is evaluating the product. Anonymous history that "just works" without account creation is a product decision, not a technical limitation.

## Success criteria

- Full planner → checkout → confirmation flow works end to end
- A trip confirmed on the web shows up in the Android app's history
- A trip confirmed on the Android app shows up in the web's history with a "Confirmed via [provider]" label
- Real device usage tracked on the Android app renders as a live chart on the web
- `npm run build` and `go test ./...` both pass cleanly
