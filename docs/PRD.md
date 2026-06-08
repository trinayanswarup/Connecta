# Connecta — Product Requirements Document

## Product Summary

Connecta is a premium consumer travel eSIM planner. Travelers describe their trip — destination, dates, and how they use their phone — and Connecta recommends the right eSIM plan, explains the reasoning, and gives a practical setup guide.

The product has two input modes:

- **Form planner** — structured destination, date, and usage inputs
- **Natural language chat agent** — user types freely and an AI agent parses intent, extracts structured inputs, and calls the same recommendation engine

Both modes are powered by the same Go GraphQL backend. The AI enhances the experience but never overrides the deterministic recommendation engine.

Connecta should feel like a real premium travel connectivity brand — calm, clean, trustworthy — not a developer tool or AI demo. Visual references: Saily, Holafly, Airalo.

---

## Problem

Travelers face confusing mobile connectivity choices:

- Roaming is expensive and unpredictable
- Airport SIM counters add friction after arrival
- Plan sizes, validity windows, and country coverage are hard to compare
- Setup instructions are unclear until you're already abroad
- Most comparison flows are too technical or cluttered

Connecta solves this by turning trip details and usage habits into a clear eSIM recommendation, with alternatives and a step-by-step setup guide.

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
5. Persist trip history to Supabase
6. Deploy with a live URL before applying to any internship

---

## Non-Goals

- No user authentication for MVP (anonymous session-based history is enough)
- No Kubernetes, Kafka, Terraform, or microservices
- No copying of Holafly, Airalo, or Saily code, branding, or assets
- No engineering/AI terminology visible to users ("GraphQL", "Groq", "agent", "mutation", "LLM")
- No replacing the deterministic backend recommendation engine with AI

---

## Complete Feature Set

### 1. Homepage

A premium travel-focused landing page. Not a SaaS dashboard.

**Hero section**

- Strong travel headline (e.g. "Stay connected anywhere in the world")
- Short support copy about no roaming, no plastic SIMs
- Primary CTA: "Find my plan" → `/trip/new`
- Secondary CTA: "Browse destinations" → scrolls to destination directory
- Travel visual, not a product screenshot

**Compact planner strip below hero**

- Destination input (autocomplete from catalog)
- Start date / end date
- CTA: "Get recommendation" → `/trip/new?destination=...&startDate=...&endDate=...`

**Popular destinations**

- Image cards for 8–10 popular destinations
- Each links to `/trip/new?destination=...`

**Destination directory**

- Searchable/filterable list of all destinations
- Grouped: Global, Regional (Africa, Asia, Europe, Americas, Oceania, Middle East, Caribbean), Countries
- Each destination shows example plan prices

**Static plan cards**

- Example plans per destination: 1 GB / 5 GB / 10 GB / 20 GB
- Show data, validity, price
- These are marketing examples — actual recommendation comes from backend

**eSIM explainer**

- "What is an eSIM?" — 3–4 sentences, consumer language

**How it works**

- 3 steps: Choose destination → Get recommendation → Activate and travel
- Icons, short copy

**Trust / benefits**

- 200+ destinations, instant activation, no roaming fees, works with your existing number
- Social proof or trust signals

**Final CTA**

- "Plan your trip" → `/trip/new`

---

### 2. Planner Page — Form Mode

**URL:** `/trip/new`

**Layout:** Premium consumer layout — not a SaaS form card.

- Left column: informational hero with benefit rows
- Right column: compact planner form

**Inputs:**

- Destination (text input backed by catalog autocomplete)
- Start date
- End date
- Usage levels per activity: Maps, Streaming, Social media, Video calls, Hotspot, Work
- Each level: None / Light / Moderate / Heavy
- Traveler type: inferred from usage (no separate field for consumers)
- Optional: budget

**Query param prefill:** Parse `destination`, `startDate`, `endDate` from URL and prefill inputs.

**Submission:** Calls `analyzeTrip` GraphQL mutation → renders results below the form.

---

### 3. Planner Page — Chat Agent Mode

**Tab switcher on the planner page:** "Plan my trip" (form) | "Ask AI" (chat)

**Chat UI:**

- Single text input: "Describe your trip..."
- Example prompts shown before first message
- Messages displayed as conversation bubbles
- Typing indicator while AI processes

**Agent flow:**

1. User types: _"Going to Thailand for 2 weeks in July, I use Maps a lot and stream music"_
2. Frontend sends to `POST /api/chat`
3. API route calls Groq with extraction prompt
4. Groq returns structured `TripInput` JSON
5. If complete → frontend calls `analyzeTrip` mutation → renders recommendation
6. If incomplete → AI asks a clarification question ("What dates are you travelling?")

**After recommendation:**

- Same recommendation card as form mode
- Same agent steps panel
- Option to adjust inputs and re-run

**Consumer language only.** Never display "GraphQL", "Groq", "agent", "mutation", or "LLM".

---

### 4. Recommendation Results

Displayed below the planner (both modes).

**Best match card**

- Plan name, provider, data (GB), validity (days), price (USD)
- AI-enhanced recommendation text explaining why this plan fits
- "Select this plan" CTA → checkout

**Alternative plans**

- 2–3 alternatives as smaller cards
- Each shows name, data, price, tradeoff note

**Usage breakdown**

- Visual breakdown of estimated data per activity
- Total estimated GB vs recommended GB (with safety buffer)

**Setup guide**

- Before departure, airport setup, offline strategy, backup internet, emergency access
- 1–3 bullet points each
- Enhanced by Groq when API key is configured

**Collapsible agent steps panel**

- "How Connecta decided this" — collapsed by default
- Shows each step: Usage estimation → Plan optimisation → AI guide generation
- Each step shows name, status (completed/skipped/failed), duration, summary
- Consumer language: "Estimated your data needs", not "UsageEstimator.Estimate()"

---

### 5. Destination Pages

**URL:** `/esim/[destination]`

- Destination name and region
- Available plan sizes with prices (from catalog)
- Coverage information
- CTA: "Plan my trip to [destination]" → `/trip/new?destination=...`

---

### 6. Trip History

**URL:** `/history`

- List of past trip analyses saved to Supabase
- Each entry: destination, dates, selected plan, recommendation summary
- Click to expand full recommendation
- Persisted anonymously (no auth required for MVP)

---

### 7. Checkout Page

**URL:** `/checkout`

- Summary of selected plan
- Data, validity, price
- Trust points: instant activation, works on arrival, cancel anytime
- "Proceed" CTA (placeholder — no real payment for MVP)

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
  → TripRepository.SaveAnalysis()        Supabase
  → returns TripAnalysis + AgentSteps
```

**GraphQL schema:** `backend/graph/schema.graphqls` — source of truth.
**Domain types:** `backend/internal/domain/domain.go`
**Supabase schema:** `supabase/schema.sql` — apply once, no migrations needed for MVP.

---

## Design System

**Palette**
| Token | Value |
|---|---|
| Base | `#FAFAF8` (ivory white) |
| Mint band | `#F0FDF4` |
| Blue band | `#EFF6FF` |
| Peach band | `#FFF7ED` |
| Text primary | `#0F172A` (deep navy) |
| Text secondary | `#64748B` |
| Accent teal | `#0D9488` |
| Accent blue | `#3B82F6` |
| Accent coral | `#F97316` |

**Components**

- Cards: `rounded-2xl`, `shadow-sm`, white background, `p-6` or `p-8`
- Buttons: `rounded-full` for primary CTAs, `rounded-lg` for secondary
- Inputs: `rounded-xl`, subtle border, focus ring in teal
- Section spacing: `py-20` or `py-24`

**Typography**

- Headings: bold, large, navy
- Body: readable, generous line height (`leading-relaxed`)
- No monospace fonts in consumer UI

**Never use**

- Dark backgrounds in main content areas
- Dense form cards with heavy borders
- Engineering/AI terminology in consumer copy
- Decorative clutter

---

## Tech Stack

| Layer      | Technology                                                     |
| ---------- | -------------------------------------------------------------- |
| Frontend   | Next.js 14 App Router, TypeScript strict, Tailwind CSS, Lucide |
| Backend    | Go 1.22, GraphQL (gqlgen)                                      |
| AI         | Groq API — `llama-3.3-70b-versatile`                           |
| Database   | Supabase (Postgres)                                            |
| Analytics  | PostHog — `destination_searched`, `recommendation_viewed`      |
| Deployment | Vercel (frontend), Railway (backend)                           |
| Tests      | Go test, Vitest, Playwright                                    |
| CI/CD      | GitHub Actions                                                 |

---

## Build Priority Order

1. UI polish — homepage and planner to Saily/Holafly level
2. Natural language chat agent — tab on planner page
3. Real plan data — replace mock_plans.go with real Airalo/Holafly data
4. Agent steps panel — visible, well-designed, consumer language
5. Groq smoke test — real API key, confirm enhancement fires
6. Supabase persistence — wire trip_repository.go
7. Trip history page — pull from Supabase
8. PostHog — two events
9. Tests — Go unit, Vitest, one Playwright E2E
10. CI/CD — GitHub Actions
11. Docker Compose — fully functional local dev
12. Deploy — Vercel + Railway, live URL
13. README — live URL, architecture, AI stack, how to run

---

## Success Criteria

- Homepage looks and feels like a premium travel connectivity product
- Chat agent correctly extracts trip intent from natural language and returns a recommendation
- Groq enhancement is visible in the recommendation text and setup guide
- Agent steps panel shows the pipeline reasoning in consumer language
- Trip history persists to Supabase across sessions
- Live URL exists and the full flow works end to end
- TypeScript strict passes with zero errors
- Go tests pass
- One Playwright E2E test covers the full planner flow

---

## Future (Post-MVP)

- Real eSIM provider API integration (Airalo API)
- Device compatibility checker
- Multi-country itinerary builder
- Currency localisation
- User accounts and order history
- Plan price alerts
- Partner/affiliate links
