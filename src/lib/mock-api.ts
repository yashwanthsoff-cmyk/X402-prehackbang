/**
 * MOCK x402 API LAYER — frontend-only phase.
 *
 * Every function here is a stub with realistic delays. A backend engineer can
 * swap each body for a real fetch against the x402 endpoints without touching
 * any component logic: keep the signatures and returned shapes identical.
 */

import {
  buildQuote,
  formatAge,
  marketById,
  STALE_THRESHOLD_MINUTES,
  type PriceQuote,
} from "./mock-data";

export const PRICE_PER_QUERY = 0.01; // mock USDC
export const PRICE_PER_COMPARE = 0.05; // mock USDC (premium)

export const MOCK_PAY_TO = "MANDIPULSE7QJ4XWZ2K5RD3H6VYB8N9CTLPF0AGSMEU1IOQZXV";

export type StepId = "request" | "402" | "signed" | "verify" | "settle" | "response";

export const STEPS: { id: StepId; label: string }[] = [
  { id: "request", label: "Request sent" },
  { id: "402", label: "402 Payment Required" },
  { id: "signed", label: "Signed retry" },
  { id: "verify", label: "Facilitator verifying" },
  { id: "settle", label: "Settling on Algorand" },
  { id: "response", label: "Paid response received" },
];

export type Receipt = {
  txId: string;
  amount: number;
  payTo: string;
  timestamp: string;
  network: "Algorand MainNet";
};

export type QuoteFailure =
  | { kind: "invalid-selection"; message: string }
  | { kind: "market-not-found"; message: string }
  | { kind: "stale-data"; message: string; quote: PriceQuote };

export type QuoteResult =
  | { ok: true; quote: PriceQuote; receipt: Receipt }
  | { ok: false; failure: QuoteFailure; receipt?: Receipt };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jitter = (min = 400, max = 1200) => min + Math.random() * (max - min);

function mockTxId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let out = "";
  for (let i = 0; i < 52; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function mockReceipt(amount: number): Receipt {
  return {
    txId: mockTxId(),
    amount,
    payTo: MOCK_PAY_TO,
    timestamp: new Date().toISOString(),
    network: "Algorand MainNet",
  };
}

/**
 * Simulated 402 loop. `onStep` is called as each phase of the loop begins so the
 * UI can render the full request → 402 → verify → settle → response lifecycle.
 */
export async function mockPayAndFetch(
  amount: number,
  onStep: (step: StepId) => void,
): Promise<Receipt> {
  for (const step of STEPS) {
    onStep(step.id);
    await wait(jitter(step.id === "settle" ? 700 : 400, step.id === "settle" ? 1200 : 900));
  }
  return mockReceipt(amount);
}

export type QuoteRequest = {
  state: string;
  district: string;
  marketId: string;
  commodityId: string;
};

/** Mock replacement for: GET /v1/price-quote (x402 metered) */
export async function mockFetchQuote(
  req: QuoteRequest,
  onStep: (step: StepId) => void,
): Promise<QuoteResult> {
  if (!req.state || !req.district || !req.marketId || !req.commodityId) {
    await wait(300);
    return {
      ok: false,
      failure: {
        kind: "invalid-selection",
        message: "Complete every field — state, district, market and commodity are all required.",
      },
    };
  }

  const receipt = await mockPayAndFetch(PRICE_PER_QUERY, onStep);
  const quote = buildQuote(req.marketId, req.commodityId);

  if (!quote) {
    const market = marketById(req.marketId);
    return {
      ok: false,
      receipt,
      failure: {
        kind: "market-not-found",
        message: `${market?.name ?? "That market"} does not report this commodity. Try a nearby market in ${market?.district ?? "the same district"}.`,
      },
    };
  }

  if (quote.ageMinutes > STALE_THRESHOLD_MINUTES) {
    return {
      ok: false,
      receipt,
      failure: {
        kind: "stale-data",
        message: `No fresh observation from ${quote.market}. Showing last known price from ${formatAge(quote.ageMinutes)}.`,
        quote,
      },
    };
  }

  return { ok: true, quote, receipt };
}

export type CompareResult =
  | {
      ok: true;
      a: PriceQuote;
      b: PriceQuote;
      spread: number;
      spreadPct: number;
      direction: string;
      receipt: Receipt;
    }
  | {
      ok: false;
      failure:
        | { kind: "same-market"; message: string }
        | { kind: "no-coverage"; message: string; side: "A" | "B" }
        | { kind: "stale-side"; message: string; a: PriceQuote | null; b: PriceQuote | null };
      receipt?: Receipt;
    };

/** Mock replacement for: GET /v1/market-signal (x402 premium) */
export async function mockFetchSignal(
  commodityId: string,
  marketA: string,
  marketB: string,
  onStep: (step: StepId) => void,
): Promise<CompareResult> {
  if (marketA && marketA === marketB) {
    await wait(250);
    return {
      ok: false,
      failure: {
        kind: "same-market",
        message: "Market A and Market B must differ — a spread needs two distinct markets.",
      },
    };
  }

  const receipt = await mockPayAndFetch(PRICE_PER_COMPARE, onStep);
  const a = buildQuote(marketA, commodityId);
  const b = buildQuote(marketB, commodityId);

  if (!a || !b) {
    const side: "A" | "B" = !a ? "A" : "B";
    const missing = marketById(side === "A" ? marketA : marketB);
    return {
      ok: false,
      receipt,
      failure: {
        kind: "no-coverage",
        side,
        message: `Market ${side} (${missing?.name ?? "unknown"}) has no coverage for this commodity, so no spread can be computed.`,
      },
    };
  }

  if (a.ageMinutes > STALE_THRESHOLD_MINUTES || b.ageMinutes > STALE_THRESHOLD_MINUTES) {
    const staleSide = a.ageMinutes > STALE_THRESHOLD_MINUTES ? a : b;
    return {
      ok: false,
      receipt,
      failure: {
        kind: "stale-side",
        a,
        b,
        message: `${staleSide.market} last reported ${formatAge(staleSide.ageMinutes)}. A spread across data this old would not be tradeable.`,
      },
    };
  }

  const spread = b.modal - a.modal;
  return {
    ok: true,
    a,
    b,
    spread,
    spreadPct: Math.round((Math.abs(spread) / a.modal) * 1000) / 10,
    direction: spread === 0 ? "No gap" : spread > 0 ? `${b.market} higher` : `${a.market} higher`,
    receipt,
  };
}

/** Mock replacement for: the foundation/status probe the backend will expose. */
export const FOUNDATION_CHIPS = [
  { label: "MainNet", state: "ok" as const },
  { label: "HTTPS", state: "ok" as const },
  { label: "GoPlausible facilitator", state: "ok" as const },
  { label: "Bazaar discovery", state: "ok" as const },
  { label: "x402-global-challenge", state: "ok" as const },
];