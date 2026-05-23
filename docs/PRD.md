# Connecta Product Requirements Document

## Product Summary

Connecta is a premium consumer travel eSIM planning product. It helps travelers choose a destination or regional plan, understand likely data needs, compare plan options, and receive a practical setup guide before departure.

The product should feel like a real travel connectivity company rather than a technical demo, admin dashboard, or AI-agent interface. The frontend experience is inspired by the product flow patterns of leading eSIM brands such as Holafly and Airalo, while the visual polish follows a clean premium SaaS/product website direction: strong typography, generous whitespace, rounded cards, soft pastel sections, and subtle motion.

## Problem

Travelers often face confusing mobile connectivity choices:

- Roaming can be expensive and unpredictable.
- Airport SIM counters add friction after arrival.
- Plan sizes, validity windows, and country coverage are hard to compare.
- Setup steps are often unclear until the user is already traveling.
- Existing comparison flows can feel too technical or cluttered.

Connecta solves this by turning trip details and usage patterns into a clear travel eSIM recommendation with alternatives and setup guidance.

## Target Users

### Primary

- Leisure travelers planning trips abroad.
- Solo travelers and couples who need reliable data for maps, messaging, rides, and social apps.
- Remote workers and business travelers who need hotspot, video calls, and work reliability.

### Secondary

- Families planning shared travel connectivity.
- Multi-country travelers who need regional or global plans.
- Recruiters and reviewers evaluating the project as a full-stack product build.

## Product Goals

- Present Connecta as a premium consumer eSIM/travel connectivity brand.
- Provide a clear destination-first product flow.
- Preserve the existing backend recommendation engine and GraphQL flow.
- Keep technical implementation details hidden from customer-facing UI.
- Offer destination browsing, country/regional/global plan discovery, plan cards, recommendation results, alternatives, usage breakdown, and setup guidance.
- Maintain a polished frontend that feels production-ready.

## Non-Goals

- Do not build a dashboard or admin panel.
- Do not expose backend, GraphQL, agent, trace, or engineering language in customer-facing copy.
- Do not replace backend recommendation logic with static frontend plan cards.
- Do not copy Holafly, Airalo, Cleaq, or any third-party code, branding, logos, or proprietary assets.
- Do not introduce complex infrastructure such as Kubernetes, Kafka, Terraform, or microservices for the MVP.

## User Journey

### 1. Homepage Discovery

The homepage should communicate the emotional travel value first:

- Strong travel-focused hero headline.
- Short support copy about staying connected abroad.
- Primary CTA: find a plan.
- Secondary CTA: browse destinations.
- Travel visual area, not a dashboard preview.

Below the hero, the user sees a compact planner/search section:

- Destination input.
- Travel dates.
- CTA to find a plan.

The homepage also includes:

- Popular destination image cards.
- Expandable all-destinations directory.
- Country, regional, and global destination options.
- Static plan cards showing multiple plan sizes.
- What is an eSIM section.
- How it works in three steps.
- Benefits and trust cards.
- Final planning CTA.

### 2. Destination Browsing

Users can browse:

- Popular destinations.
- Global plan.
- Continent and regional plans, including Africa, Asia, Europe, North America, South America, Oceania, Middle East, and Caribbean.
- Country-level plans.

Each destination or region should imply multiple available plans with examples such as:

- 1 GB / 7 days / US$8.99
- 2 GB / 15 days / US$16.49
- 5 GB / 60 days / US$33.99
- 10 GB / 180 days / US$56.99
- 20 GB / 365 days / US$66.99
- 50 GB / 365 days / US$129.99

These plan cards are marketing examples. The actual recommendation still comes from the backend.

### 3. Planner Page

The planner page should use a premium consumer layout:

- Informational hero on the left.
- Benefit rows with icons and separators.
- No right-side dashboard panel.
- No mock recommendation panel in the hero.
- No giant bordered form card.

Planner inputs should be compact and approachable:

- Destination, backed by the destination catalog.
- Start date.
- End date.
- Usage levels for maps, streaming, social media, video calls, hotspot, and work.
- CTA button.

Usage levels should be concrete and user-controlled:

- None.
- Light.
- Moderate.
- Heavy.

### 4. Recommendation Results

After submission, Connecta calls the existing GraphQL `analyzeTrip` flow and renders:

- Best match recommendation.
- Selected plan details.
- Setup guide.
- Alternative plans.
- Usage breakdown.
- Collapsible recommendation process.

The recommendation process stays hidden/collapsible and uses consumer-facing language.

## Functional Requirements

### Homepage

- Render premium travel hero with no planner form inside the hero.
- Render a compact planner below hero.
- Destination search must navigate to `/trip/new?destination=...`.
- Dates should prefill `/trip/new` when included.
- Popular destination cards must link to `/trip/new?destination=...`.
- Destination directory must support country, regional, and global options.
- Destination directory should support search/filter behavior.
- Static plan cards should show multiple data/price/validity combinations.

### Planner Page

- Parse `destination`, `startDate`, and `endDate` from query params.
- Prefill planner inputs when query params are present.
- Preserve the GraphQL mutation flow through `analyzeTrip`.
- Preserve `TripInput`, `TripAnalysis`, selected plan, alternatives, usage breakdown, and setup guide.
- Allow users to choose detailed usage levels per activity.
- Infer traveler type from usage when the simplified consumer form does not expose traveler type directly.
- Render results below the planner.

### Destination Catalog

- Provide frontend-only destination constants for global, regional, and country entries.
- Provide frontend-only marketing plan examples.
- Reuse catalog options in home search, destination directory, and planner datalist.

## Design Requirements

- Light mode only.
- Ivory/white base.
- Soft mint, blue, and peach section bands.
- Deep navy text.
- Teal, blue, and coral accents.
- Rounded premium cards.
- Subtle shadows.
- Smooth hover interactions.
- Generous whitespace.
- Strong typography.
- Consumer travel product feel.

Avoid:

- Dashboard styling.
- Dense enterprise form blocks.
- Engineering terminology.
- Overly dark technical panels.
- Card-within-card clutter.

## Technical Requirements

### Frontend

- Next.js app router.
- TypeScript strict mode.
- Tailwind styling.
- Lucide icons.
- Components should remain small and composable.
- New frontend-only catalog data should live in `frontend/lib/destination-catalog.ts`.

### Backend

- Go backend.
- GraphQL API.
- Resolver layer remains thin.
- Business logic remains in services.
- Recommendation engine remains deterministic with optional AI enhancement.
- No backend schema changes required for the frontend redesign.

## Success Criteria

- Homepage looks like a premium travel connectivity website.
- Planner page no longer resembles a SaaS dashboard.
- Users can select detailed usage levels.
- Destination options include global, regional, and broad country coverage.
- Recommendation submission still works end to end.
- No customer-facing backend, GraphQL, trace, agent, or engineering language.
- Typecheck and targeted lint pass.

## Verification Checklist

- `npm run typecheck`
- Targeted ESLint for changed frontend files.
- Browser verify homepage hero, compact planner, destination directory, plan cards, and CTAs.
- Browser verify planner prefill from query params.
- Browser verify detailed usage controls.
- Browser verify recommendation results, setup guide, alternatives, usage breakdown, and collapsed process.

## Future Enhancements

- Real provider pricing and availability by destination.
- Real country flags and region illustrations.
- Plan detail pages for each country/region.
- Checkout flow.
- Device compatibility checker.
- Saved trips.
- Multi-country itinerary builder.
- Currency localization.
- User account and order history.
