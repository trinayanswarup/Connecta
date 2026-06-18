# Connecta Agent Guide

## Product Intent

Connecta is a premium consumer travel eSIM planner. It should feel like a real travel connectivity company (Saily, Holafly, Airalo) — calm, polished, destination-first, easy to trust. Never a dashboard, never a developer tool, never an "AI demo."

The MVP combines:

- A Next.js consumer frontend.
- A Go GraphQL backend.
- A deterministic trip recommendation service, optionally enhanced by Groq.
- A real checkout that confirms a purchase, not a simulated delay.
- A second, separate client — **SailGuard**, a native Android app in its own repo — sharing this exact backend over the same GraphQL contract.

For full product context, read `docs/PRD.md`.

## The cross-app boundary — read this before touching the GraphQL schema

`schema.graphqls`'s `confirmTrip`, `submitUsageSnapshot`, `tripsBySession`, and `tripUsage` fields are not internal-only — SailGuard calls these directly. You will not have SailGuard's repo open while working here, which makes it easy to forget it exists. Before changing the shape of any of those fields, or the `trips`/`usage_snapshots` tables they read and write, consider that a breaking change has a second, invisible consumer.

This is also why `confirmTrip` accepts an optional `tripId`: SailGuard never calls `analyzeTrip` (it has its own plan-recommendation logic, not Connecta's AI flow), so it has no existing trip to attach a confirmation to — the mutation has to be able to create-and-confirm a trip in one step. Don't "simplify" this into requiring a `tripId` without checking what that breaks.

## Experience Principles

- Build for travelers, not engineers.
- Keep the interface light, emotional, and consumer-friendly.
- Use travel language: destination, plan, setup, data, arrival, roaming, trip.
- Never expose backend, GraphQL, trace, agent, model, or implementation language in customer-facing UI.
- Prefer compact inputs and clear choices over dense forms.
- Keep recommendation process details hidden/collapsible and worded for consumers.
- A "Confirmed" or "Synced from [provider]" badge on a history card is fine, consumer-legible language — "confirmTrip mutation succeeded" is not.

## Visual Direction

- Light mode. Ivory/white base (`#FAFAF8`).
- Soft mint, pale blue, and warm peach section backgrounds for marketing surfaces.
- Deep navy text (`slate-950` in practice).
- Orange (`#EA580C`) is the actual accent color in use across checkout, history, and the live usage chart — restrained but consistent. Teal/coral were earlier exploratory choices; orange is what's actually shipped.
- Rounded premium cards (`rounded-2xl`), subtle shadows, generous spacing, strong typography.

Avoid: SaaS dashboards, admin panels, dense enterprise form layouts, heavy gray/blue input blocks, decorative clutter.

## Core Flows (all real, none of these are stubs)

### Planner
Form or natural-language chat → `analyzeTrip` → recommendation with selected plan, alternatives, usage breakdown, connectivity guide, collapsible agent trace.

### Checkout
Real — calls `confirmTrip`, persists `confirmed_at`/`confirmed_plan` on the trip row. A failure shows an actual error state, it doesn't fake success.

### History
Three distinct badge states on a trip card, and they mean different things — don't collapse them into one "done" indicator:
- **Recommended** (orange) — what `analyzeTrip` suggested, never purchased
- **Confirmed** (emerald) — actually purchased, via this same web checkout
- **Confirmed via [Provider]** — purchased through a different client (SailGuard) on the same session, surfaced via `tripsBySession`

### Trip detail (`/trip/[id]`)
Shows the confirmed plan and a live usage chart sourced from `usage_snapshots` — real device data pushed by SailGuard every 30 seconds while a trip is active, not synthetic. Polls every 30s itself to stay current. If a trip has no snapshots (e.g. it was only ever confirmed via web, never run through SailGuard), the empty state should say so plainly, not look broken.

## Data and Catalog Rules

- Destination catalog lives in `frontend/lib/destination-catalog.ts` — marketing/browsing data, illustrative.
- The actual plan catalog used by `analyzeTrip` and `confirmTrip` is `backend/internal/plans/mock_plans.go` — a flat global price list, not per-destination. SailGuard's plan catalog was deliberately ported from this exact file so both clients quote the same prices; if you change one, the other goes out of sync (different repo, no automated check for this — it's a manual discipline).
- Actual recommendations always come from the backend, never frontend-computed.

## Frontend Rules

- TypeScript strict mode.
- Tailwind + existing component patterns. Lucide icons.
- Keep components composable, small.
- No visible engineering language in customer-facing copy.
- Check mobile and desktop layout when touching major surfaces.

## Backend Rules

- Go. Keep GraphQL resolvers thin — business logic belongs in `services/`.
- After editing `schema.graphqls`, run `go run github.com/99designs/gqlgen generate`, then `go build ./...` — gqlgen requires Go ≥1.25.
- Validate all Groq JSON output; never let a malformed AI response surface as a broken response — fall back to deterministic text instead.
- Add tests for new business logic (`services/`, `repositories/`) — these are realistically testable in isolation even without a live Postgres connection.
- Never hardcode secrets.

## MVP Constraints

- No Kubernetes, Kafka, Terraform, or microservices.
- One polished vertical flow at a time — this project has grown by adding real, working slices (checkout, then SailGuard sync, then live usage), not by adding scaffolding for things that don't work yet.
- Free tier only: Groq, Supabase, Vercel, Railway. No paid dependency gets added without an explicit decision to do so.

## Verification

Frontend: `npx tsc --noEmit` and `npm run build` (not just `tsc` alone — it has missed real issues in this project before). Browser-verify the actual flow you touched.

Backend: `go test ./...`, `gofmt` on every edited file (CI checks formatting and has failed on CRLF line-ending issues from Windows checkouts before).

Product/UI: confirm no engineering language leaks into customer-facing text. Confirm the planner still calls the real `analyzeTrip` flow and checkout still calls the real `confirmTrip` flow — neither should silently become a mock again.
