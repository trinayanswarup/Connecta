# Connecta Agent Guide

## Product Intent

Connecta is a premium consumer travel eSIM planner. The product should feel like a real travel connectivity company: calm, polished, destination-first, and easy to trust.

The current MVP combines:

- A Next.js consumer frontend.
- A Go GraphQL backend.
- A deterministic trip recommendation service.
- Optional AI-enhanced guide generation.
- Frontend-only destination and marketing plan catalog data.

For full product context, read `docs/PRD.md`.

## Experience Principles

- Build for travelers, not engineers.
- Keep the interface light, emotional, and consumer-friendly.
- Use travel language: destination, plan, setup, data, arrival, roaming, trip.
- Do not expose backend, GraphQL, trace, agent, model, or implementation language in customer-facing UI.
- Prefer compact inputs and clear choices over dense forms.
- Use destination browsing and plan cards to make the product feel real.
- Keep recommendation process details hidden/collapsible and worded for consumers.

## Visual Direction

- Light mode.
- Ivory and white base.
- Soft mint, pale blue, and warm peach section backgrounds.
- Deep navy text.
- Restrained teal, blue, and coral accents.
- Rounded premium cards.
- Subtle shadows.
- Generous spacing.
- Strong typography.
- Smooth hover interactions.

Avoid:

- SaaS dashboards.
- Admin panels.
- Dense enterprise form layouts.
- Heavy gray/blue input blocks.
- Overly technical mock panels.
- Decorative clutter that distracts from the travel flow.

## Core Flows

### Homepage

The homepage should include:

- Travel-focused hero with primary and secondary CTAs.
- Compact planner/search below hero.
- Popular destination cards.
- Expandable destination directory.
- Global, regional, and country destination options.
- Static plan examples with data, validity, and price.
- eSIM explainer.
- Three-step how-it-works section.
- Benefits/trust cards.
- Final planning CTA.

### Planner Page

The planner page should include:

- Left-side informational hero with benefits.
- No right-side mock recommendation panel unless explicitly requested.
- Compact planner section below hero.
- Destination, dates, and detailed usage controls.
- Recommendation results below the planner.

Detailed usage controls should let users choose:

- None.
- Light.
- Moderate.
- Heavy.

Activities:

- Maps.
- Streaming.
- Social media.
- Video calls.
- Hotspot.
- Work.

### Recommendation Results

Keep rendering:

- Best match.
- Selected plan.
- Setup guide.
- Alternatives.
- Usage breakdown.
- Hidden/collapsible recommendation process.

## Data and Catalog Rules

- Destination catalog lives in `frontend/lib/destination-catalog.ts`.
- Include global and regional entries.
- Include broad country coverage.
- Each destination should have multiple frontend marketing plan examples.
- Marketing plan cards are illustrative.
- Actual recommendations must continue to come from the backend.

## Frontend Rules

- Use TypeScript strict mode.
- Use Tailwind and existing component patterns.
- Use lucide icons when icons are needed.
- Keep components composable.
- Avoid visible text explaining implementation details.
- Check mobile and desktop layout when touching major surfaces.
- Do not copy external brand code, assets, logos, or text.

## Backend Rules

- Use Go for backend logic.
- Keep GraphQL resolvers thin.
- Business logic belongs in services.
- Agents/services should have one responsibility each.
- Validate all AI outputs.
- Use structured JSON responses.
- Add tests for business logic.
- Keep execution observable internally, but not exposed as customer-facing product copy.
- Do not hardcode secrets.

## MVP Constraints

- Preserve the existing GraphQL flow.
- Preserve backend recommendation logic.
- Preserve setup guide, alternatives, usage breakdown, and collapsible process.
- Avoid Kubernetes, Kafka, Terraform, microservices, and distributed infrastructure for the MVP.
- Build one polished vertical flow before adding broad surface area.

## Verification

For frontend changes:

- Run `npm run typecheck`.
- Run targeted ESLint for changed files.
- Browser verify homepage and planner flows.

For backend changes:

- Run `go test ./...`.
- Run `gofmt` on edited Go files.

For product/UI changes:

- Confirm no visible engineering/agent/backend/GraphQL language appears in customer-facing UI.
- Confirm destination search and destination cards navigate to `/trip/new?destination=...`.
- Confirm planner submission still calls the existing recommendation flow.
