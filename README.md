# Mandi Pulse Insights

MandiPulse — Master Frontend Build Prompt

Project Summary

Build MandiPulse, a pay-per-query x402 API product for Algorand, sold as a frontend web app that showcases three endpoints an AI agent can call: a metered mandi price-quote lookup, a spend policy guard for agent budgets, and a premium multi-market comparison signal. This is a frontend-only build. Backend, real x402 payment flow, MainNet deployment, and facilitator integration will be wired up later — for now, every endpoint interaction should be simulated with realistic mock data, loading states, and error states so the UI is fully demoable without a live server.

Do not implement real payment logic, real API calls, or real wallet connections. Stub them with clearly-named mock functions (e.g. mockPayAndFetch()) so backend wiring later is a drop-in replacement, not a rewrite.

Product Framing (for copy/content on the site)

MandiPulse sells verified Indian mandi (agricultural market) price data to AI agents on a pay-per-query basis, using the x402 payment protocol on Algorand. One core paid endpoint, one safety/control layer, one premium paid endpoint — all under one merchant identity.

Tagline: "Pay-per-query mandi data for AI agents, settled on Algorand."

Feature 1: Metered Price-Quote Endpoint (primary feature — build first, most detail)

What it does: An AI agent selects state → district → market → commodity, gets a 402 Payment Required if unpaid, and after payment settles, receives a structured mandi price quote.

Screens/components to build:

A query builder form: cascading selects for State → District → Market → Commodity (use mock data — a small realistic dataset of ~5 states, a few districts and markets each, and common commodities like onion, tomato, wheat, rice).

A "Get Quote" primary CTA button.

Simulated request lifecycle shown visually, step by step: Request sent → 402 Payment Required → Signed retry → Facilitator verifying → Settling → Paid response received. This should render as a small horizontal stepper or timeline, not just a spinner — this is the core "wow" moment of the demo.

A results card showing: commodity, market, price range (min/modal/max), unit, and a data freshness timestamp with visible age (e.g. "Updated 2 hours ago").

A transaction receipt panel: mock transaction ID, amount paid (in mock USDC), payTo address (mock, truncated with copy button), timestamp.

3 high-priority gaps to visibly reflect in the UI (even though backend is mocked):

Full loop visibility — the 402 → verify → settle → response loop must be visually explicit on screen, not hidden behind a single loading spinner, because this loop is the entire point of the product and judges/users need to see it happen.

Submission-readiness signals — include a small "status" panel or badge row showing MainNet / HTTPS / GoPlausible facilitator / Bazaar discovery / x402-global-challenge tag as visual chips (mock "connected" state for now, but built as real status indicators the backend will later populate for real).

Reliability states — design distinct visual states for: invalid selection, market not found, and stale/no-data (show last-known age instead of a blank failure). These are real UI states, not just copy — build them now so they're not an afterthought later.

Feature 2: Spend Policy Guard

What it does: Lets an AI agent operate under per-query and per-session budget limits, checked before any payment is attempted.

Screens/components to build:

A settings panel: per-query max spend and per-session max spend, editable with simple numeric inputs (use the form spacing/validation rules below).

A live "session budget" indicator — a slim progress/meter component showing spend used vs. limit, always visible near the query builder.

When a mock query would exceed budget: block it before showing any payment step, and show a clear inline deny state (not a toast) — e.g. "Blocked: exceeds session limit ($X remaining)".

A small log/list of recent decisions (allowed vs blocked), each with a one-line reason, so the enforcement logic is visible over time, not just once.

3 high-priority gaps to reflect in UI:

Guard check happens visually before the payment stepper ever appears — blocked requests never show 402/verify/settle steps.

Retries (if the user clicks "try again") must re-trigger the guard check, not skip straight to payment — show this explicitly rather than assuming it.

Deny reasons must be specific and visible in both the inline state and the decision log, not generic ("Blocked" alone is not enough — always state which limit and by how much).

Feature 3: Multi-Market Research Signal (premium endpoint)

What it does: Agent pays a higher price to compare two markets for the same commodity and receive a price-gap/spread signal instead of raw data.

Screens/components to build:

A comparison form: one commodity selector, two market selectors (Market A / Market B).

Same payment stepper pattern as Feature 1, but visually marked as "Premium" (e.g. a distinct badge, not a different color system — stay within the one-accent-color rule using weight/label instead of new hues).

Results view: a simple two-column or side-by-side comparison card showing both markets' prices, a computed spread/gap, and freshness timestamps for both data points individually.

Validation states: block same-market comparisons inline before submission (disable the CTA or show inline error), and show a clear "unavailable" state if one side lacks recent data — this must look different from a generic error, since it's a data-quality state, not a system failure.

3 high-priority gaps to reflect in UI:

Treat this as its own full paid flow (its own 402/verify/settle stepper), not a variant of Feature 1's UI reused sloppily — same pattern, separate instance.

Same-market comparison is blocked at the form level, and stale/missing data on either side gets its own distinct empty/error state.

Both markets' freshness ages are always shown side-by-side in results — never omit one even if it's fresher, since the comparison's credibility depends on both being visible.

Site Structure

Landing/overview page: one-liner, three feature cards (Number → Title → short description → CTA, per the card spec below), and the required-foundation status chip row (MainNet/HTTPS/GoPlausible/Bazaar/tag) shown once near the top as social proof of build maturity, even while mocked.

Three feature pages/panels as described above — can be tabs within one dashboard-style app, or separate routes. Prefer a single dashboard shell with a left nav (desktop) / drawer (mobile) switching between the three features plus an "Activity" view.

Activity/Dashboard view: a lightweight table or card list of recent mock transactions across all three endpoints (timestamp, endpoint, amount, status) — this doubles as your live demo dashboard.

Design System (apply exactly — do not deviate or invent new tokens)

Visual direction

Premium, light-first editorial tech interface. Whitespace over components. Typography is the primary visual element — not icons, not color, not shadows. One idea per section, nothing decorative without a purpose.

Color — exactly one accent, no exceptions

Light Block   #FFFFFF (page bg) · #F2F2F4 (secondary/card bg)   text: #0B0B0C
Black Block   #0E0F11                                            text: #F2F2F4
Accent Blue   #0071E3   Hover #2A8CFF   Pressed #005BB5

Text on Light: Primary #0B0B0C · Secondary #6E6E73 · Muted #C5C5C5
Surfaces: Default #F0F0F0 · Hover #E6E6E6
Border: Light rgba(0,0,0,.08) · Dark rgba(255,255,255,.15)
Status (real states only): Success #2DD36F · Warning #FFB020 · Danger #FF5A5F


Accent Blue only on interactive/actionable elements: links, button borders/text, focus rings, active nav, key data highlights, key numbers in results (e.g. the price itself).

Never use accent as decorative fill on icons/backgrounds/dividers.

At most one full-bleed dark or accent section per page, for one high-impact statement only.

WCAG AA contrast required everywhere.

Typography

Display Large   64–96px desktop / 42px mobile
Display Medium  40–56px desktop / 32px mobile
Body            16–18px minimum
Micro-label     12–13px uppercase, +0.1em tracking


Weights: 400/500/600 only. Headline tracking -0.02 to -0.04em. One display font + one body font, system-ui fallback. Body line-height 1.5–1.7.

Layout & spacing

Page max-width: 1200–1400px · Body text max-width: 600px
Margins: 64–96px desktop, 20–24px mobile
12-column grid. Section gaps: 64–120px.

Spacing scale (use ONLY these values): 4, 8, 12, 16, 24, 32, 48, 64, 96, 120px
Between unrelated sections: 64–120px
Between related elements: 8–16px
Card internal padding: 24–32px
Gap between cards: 24–32px minimum
Icon-to-text gap: 8px fixed
Button padding: 12–16px vertical, 20–24px horizontal


Before shipping any screen: could something be removed with no loss? Remove it. Only one dominant visual weight per viewport. Never two equally-loud focal points on the same screen.

Icons & images

One icon library only (Lucide or Heroicons), one stroke width (1.5–2px), never mixed. Icons inherit text color unless showing status. Fixed sizes per context (16px inline / 20px buttons / 24px nav). Consistent aspect ratio + object-fit: cover for any images. Reserved space for all media — no layout shift. Neutral placeholder block for broken/missing images, never a broken-image icon.

Elevation

No stacked box-shadows. If used at all: exactly 2 levels (resting, hover/active), reused everywhere. Z-index scale: Base 0 · Sticky nav 100 · Dropdown 200 · Modal 300 · Toast 400.

Alignment & consistency

Baseline-aligned text/icons in a row. One text alignment per block. Same-priority buttons always same height/padding app-wide. One card style, one button style, one input style reused everywhere — no per-page variants.

Overflow & content states

Truncate or explicitly wrap long text — never let it break layout. Tabular-nums for price figures so columns don't jitter. Design empty states and overflow states, not just the "ideal" middle case.

Corner radius (by component type, not by page)

0px     dividers, table rows
6–8px   inputs, buttons, chips
12px    cards, panels
16px    modals, large containers
9999px  avatars, pills, toggles, status badges


Forms & validation

Label above field (not placeholder-only). Validate on blur, not per keystroke. Error message directly under its field, same width, Danger color, plain language. Consistent required/optional convention (pick one: asterisk or "(optional)" label). Disabled fields visibly muted. Submit buttons disable/show loading during submission — no double-submit.

Loading / empty / error states (required for every mocked async action)

Loading — skeleton matching final layout shape, not a floating spinner
Empty   — icon + one-line explanation + primary action, never blank white space
Error   — plain-language explanation + retry action, never a raw error code alone


Skeleton and real content occupy identical space — no pop-in layout shift.

Responsive behavior

Grid: 4 columns desktop → 2 tablet → 1 mobile (restructure, don't just shrink)
Nav: inline links desktop → drawer/hamburger mobile, same tokens
Tables: horizontal-scroll with visible hint, or collapse to stacked cards on mobile
Touch targets: 44×44px minimum on mobile
Body text: never below 16px on mobile


Breakpoints to support: 375px, 768px, 1024px, 1440px.

Section rhythm

Alternate background tone section to section (white → light gray → white) so sections read as distinct without relying only on headings. One primary message per section. Consistent vertical padding per section type across the whole app.

Buttons

Primary   — 8px radius, Accent Blue border + text, transparent bg (solid fill reserved for exactly one primary CTA per page)
Secondary — plain text link + small arrow icon
Ghost     — no border, text only


All states implemented: default / hover / active / focus / disabled / loading.

Cards

Order: Number/label → Image (if any) → Title → Description → CTA. No shadows, 1px low-contrast border, surface-token background exactly. Hover lift 2–4px max.

Motion

Entry: fade + translateY(20–30px), 400–500ms ease-out. Hover: 200–300ms, subtle scale/opacity/border shift only — nothing bouncy. Respect prefers-reduced-motion. Max 2–3 deliberate micro-interactions per page.

Design tokens — use these exact names in code

--color-bg-light: #FFFFFF;
--color-bg-light-secondary: #F2F2F4;
--color-bg-dark: #0E0F11;
--color-text-primary: #0B0B0C;
--color-text-secondary: #6E6E73;
--color-accent: #0071E3;
--color-accent-hover: #2A8CFF;
--color-accent-pressed: #005BB5;
--color-border-light: rgba(0,0,0,0.08);
--color-border-dark: rgba(255,255,255,0.15);
--radius-sm: 8px;
--radius-md: 12px;
--radius-pill: 9999px;
--space-unit: 8px; /* multiples: 8,16,24,32,48,64,96 */


No hardcoded hex/px values in component code — everything references these tokens.

Build Constraints (frontend-only phase)

Mock all async behavior (query lookups, payment stepper, budget checks, comparisons) with realistic delays (e.g. 400–1200ms per step) so the loading/skeleton states are actually visible and demoable.

Use a small local mock dataset for states/districts/markets/commodities/prices — internally consistent so the same market always returns the same price range across the demo.

Structure mock functions so a backend engineer can later swap them for real fetch calls to x402 endpoints without touching component logic (e.g. isolate all mock logic in a /lib/mock-api.ts-style file).

No real wallet connection, no real payment library — stub with a clearly-labeled mock wallet/payTo address.

Every interactive element needs all states from the spec: idle → hover → focus → pressed → loading → success → error → disabled.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d2261e98-422e-4d05-b51f-045613faa501).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
