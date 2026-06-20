# Connecta — Agent Guide

## Product identity

Premium consumer travel eSIM planner. Should feel like Saily, Holafly, or Airalo — not a developer tool or AI demo. Never expose GraphQL, Groq, mutations, or LLM terminology in customer-facing UI.

## Design

- Background: `#FAFAF8` (ivory)
- Text: `slate-950` (`#020617`)
- Accent / CTAs: orange-600 (`#EA580C`), white text on top
- Confirmed/success: emerald-600 (`#059669`)
- Cards: `rounded-2xl`, `shadow-sm`, white, generous padding
- No dark mode, no SaaS dashboard layouts, no dense form blocks

## Consumer language only

| Never say            | Say instead                 |
| -------------------- | --------------------------- |
| analyzeTrip mutation | Get a recommendation        |
| GraphQL              | — (don't mention it)        |
| Groq / LLM / agent   | — (don't mention it)        |
| confirmTrip          | Confirm purchase / checkout |

## Three things that must always be true

1. `analyzeTrip` always produces a recommendation — Groq failure never breaks it
2. Checkout calls `confirmTrip` and actually persists — no fake delays, no simulated success
3. History shows three distinct states (Recommended / Confirmed / Confirmed via [provider]) — don't collapse them

## Android companion (SailGuard)

`confirmTrip`, `submitUsageSnapshot`, `tripsBySession`, and `tripUsage` are shared with an Android client. Schema changes to these fields affect both clients.
