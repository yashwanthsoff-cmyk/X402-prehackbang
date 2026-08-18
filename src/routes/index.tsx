import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FoundationChips } from "@/components/foundation-chips";
import { Button, MicroLabel } from "@/components/kit";
import { PRICE_PER_COMPARE, PRICE_PER_QUERY } from "@/lib/mock-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MandiPulse — Pay-per-query mandi data for AI agents" },
      {
        name: "description",
        content:
          "MandiPulse sells verified Indian mandi price data to AI agents per query, settled on Algorand with the x402 payment protocol.",
      },
      { property: "og:title", content: "MandiPulse — Pay-per-query mandi data for AI agents" },
      {
        property: "og:description",
        content:
          "Three x402 endpoints: metered price quotes, a spend policy guard, and a premium multi-market spread signal.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    n: "01",
    title: "Metered price quote",
    body: `Select state, district, market and commodity. Pay $${PRICE_PER_QUERY.toFixed(2)} and receive min, modal and max prices with the age of the observation attached.`,
    to: "/app/quote" as const,
    cta: "Open price quote",
  },
  {
    n: "02",
    title: "Spend policy guard",
    body: "Per-query and per-session budget caps evaluated before any payment is signed, with every allow and block written to a visible decision log.",
    to: "/app/guard" as const,
    cta: "Configure limits",
  },
  {
    n: "03",
    title: "Multi-market signal",
    body: `Compare one commodity across two mandis for $${PRICE_PER_COMPARE.toFixed(2)} and receive a computed price gap — a decision, not raw rows.`,
    to: "/app/compare" as const,
    cta: "Open premium signal",
  },
];

function Landing() {
  return (
    <div className="bg-page">
      <header className="border-b border-hair">
        <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-[16px] px-[20px] py-[16px] md:px-[64px]">
          <span className="min-w-0 truncate font-display text-[17px] font-semibold tracking-[-0.02em] text-ink">
            MandiPulse
          </span>
          <Link
            to="/app/quote"
            className="inline-flex min-h-[44px] items-center gap-[8px] text-[15px] font-medium text-brand transition-colors duration-200 hover:text-brand-hover"
          >
            Open demo
            <ArrowRight className="h-[16px] w-[16px]" strokeWidth={1.75} />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1400px] px-[20px] py-[64px] md:px-[64px] md:py-[120px]">
        <div className="enter flex flex-col gap-[24px]">
          <MicroLabel>x402 on Algorand · frontend demo, mocked backend</MicroLabel>
          <h1 className="display-xl max-w-[900px] text-ink">
            Pay-per-query mandi data for AI agents, settled on Algorand.
          </h1>
          <p className="max-w-[600px] text-[18px] leading-[1.6] text-ink-soft">
            MandiPulse meters verified Indian agricultural market prices at the request level. An
            agent calls, receives a 402, signs, settles, and gets structured data back — in one
            round trip.
          </p>
          <div className="mt-[16px] flex flex-wrap items-center gap-[24px]">
            <Link to="/app/quote">
              <Button variant="solid">Run a live query</Button>
            </Link>
            <Link
              to="/app/activity"
              className="inline-flex min-h-[44px] items-center gap-[8px] text-[15px] font-medium text-brand transition-colors duration-200 hover:text-brand-hover"
            >
              See activity dashboard
              <ArrowRight className="h-[16px] w-[16px]" strokeWidth={1.75} />
            </Link>
          </div>
          <div className="mt-[24px]">
            <FoundationChips />
          </div>
        </div>
      </section>

      <section className="border-y border-hair bg-page-alt">
        <div className="mx-auto max-w-[1400px] px-[20px] py-[64px] md:px-[64px] md:py-[96px]">
          <MicroLabel>Three endpoints, one merchant identity</MicroLabel>
          <div className="mt-[48px] grid grid-cols-1 gap-[32px] md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article
                key={f.n}
                className="flex flex-col rounded-[var(--radius-md)] border border-hair bg-page p-[24px] transition-transform duration-300 hover:-translate-y-[3px] md:p-[32px]"
              >
                <MicroLabel>{f.n}</MicroLabel>
                <h2 className="display-sm mt-[16px] text-ink">{f.title}</h2>
                <p className="mt-[12px] flex-1 text-[15px] leading-[1.6] text-ink-soft">{f.body}</p>
                <Link
                  to={f.to}
                  className="mt-[24px] inline-flex min-h-[44px] items-center gap-[8px] text-[15px] font-medium text-brand transition-colors duration-200 hover:text-brand-hover"
                >
                  {f.cta}
                  <ArrowRight className="h-[16px] w-[16px]" strokeWidth={1.75} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-dark">
        <div className="mx-auto max-w-[1400px] px-[20px] py-[64px] md:px-[64px] md:py-[120px]">
          <h2 className="display-md max-w-[900px] text-[color:var(--color-bg-light-secondary)]">
            Data an agent can trust, priced per answer instead of per subscription.
          </h2>
          <p className="mt-[24px] max-w-[600px] text-[17px] text-[color:var(--color-text-muted)]">
            Payment settles on Algorand MainNet through the GoPlausible facilitator, discoverable in
            Bazaar. This build simulates the loop end to end so the flow is demoable before the
            backend lands.
          </p>
        </div>
      </section>

      <footer className="border-t border-hair">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-[16px] px-[20px] py-[32px] text-[13px] text-ink-soft md:px-[64px]">
          <p>MandiPulse · x402 global challenge</p>
          <p>All payments and data on this page are simulated.</p>
        </div>
      </footer>
    </div>
  );
}
