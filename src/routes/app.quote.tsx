import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BudgetMeter } from "@/components/budget-meter";
import { FoundationChips } from "@/components/foundation-chips";
import {
  Button,
  Field,
  MicroLabel,
  Panel,
  Select,
  SkeletonBlock,
  StateBlock,
} from "@/components/kit";
import { PaymentStepper } from "@/components/payment-stepper";
import { ReceiptPanel } from "@/components/receipt-panel";
import { useAppStore } from "@/lib/app-store";
import {
  mockFetchQuote,
  PRICE_PER_QUERY,
  type QuoteResult,
  type Receipt,
  type StepId,
} from "@/lib/mock-api";
import {
  COMMODITIES,
  districtsFor,
  formatAge,
  marketsFor,
  STATES,
  type PriceQuote,
} from "@/lib/mock-data";

export const Route = createFileRoute("/app/quote")({
  head: () => ({
    meta: [
      { title: "Metered Price Quote — MandiPulse" },
      {
        name: "description",
        content:
          "Pay-per-query mandi price quotes for AI agents: select state, district, market and commodity and watch the x402 payment loop settle on Algorand.",
      },
      { property: "og:title", content: "Metered Price Quote — MandiPulse" },
      {
        property: "og:description",
        content: "A metered x402 endpoint returning verified Indian mandi price ranges.",
      },
    ],
  }),
  component: QuotePage,
});

function QuotePage() {
  const { checkBudget, recordSpend, logActivity } = useAppStore();

  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [marketId, setMarketId] = useState("");
  const [commodityId, setCommodityId] = useState("");
  const [touched, setTouched] = useState(false);

  const [step, setStep] = useState<StepId | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [denial, setDenial] = useState<string | null>(null);

  const districts = useMemo(() => (state ? districtsFor(state) : []), [state]);
  const markets = useMemo(
    () => (state && district ? marketsFor(state, district) : []),
    [state, district],
  );

  const incomplete = !state || !district || !marketId || !commodityId;

  async function run() {
    setTouched(true);
    if (incomplete) return;

    // Guard check ALWAYS runs first — before any payment step is rendered.
    setResult(null);
    setStep(null);
    const verdict = checkBudget(PRICE_PER_QUERY, "Price quote");
    if (!verdict.allowed) {
      setDenial(verdict.reason);
      logActivity({
        endpoint: "Price quote",
        amount: PRICE_PER_QUERY,
        status: "Blocked",
        detail: verdict.reason,
      });
      return;
    }
    setDenial(null);
    setRunning(true);

    const res = await mockFetchQuote({ state, district, marketId, commodityId }, setStep);
    setResult(res);
    setRunning(false);

    if (res.ok || res.receipt) recordSpend(PRICE_PER_QUERY);
    logActivity({
      endpoint: "Price quote",
      amount: PRICE_PER_QUERY,
      status: res.ok
        ? "Settled"
        : res.failure.kind === "stale-data"
          ? "Stale data"
          : res.failure.kind === "market-not-found"
            ? "No coverage"
            : "Blocked",
      detail: res.ok
        ? `${res.quote.commodity} · ${res.quote.market}`
        : res.failure.message,
      ...(res.ok ? { txId: res.receipt.txId } : res.receipt ? { txId: res.receipt.txId } : {}),
    });
  }

  return (
    <div className="flex flex-col gap-[48px]">
      <header className="flex flex-col gap-[16px]">
        <MicroLabel>Endpoint 01 · metered</MicroLabel>
        <h1 className="display-md max-w-[600px] text-ink">Price quote</h1>
        <p className="max-w-[600px] text-[17px] text-ink-soft">
          One paid lookup returns the min, modal and max price for a commodity at a single mandi,
          with the age of the observation attached. ${PRICE_PER_QUERY.toFixed(2)} per query.
        </p>
        <FoundationChips />
      </header>

      <BudgetMeter />

      <Panel>
        <MicroLabel>Query builder</MicroLabel>
        <div className="mt-[24px] grid grid-cols-1 gap-[24px] sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label="State"
            error={touched && !state ? "Select a state." : undefined}
          >
            <Select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setDistrict("");
                setMarketId("");
              }}
            >
              <option value="">Select state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="District"
            hint={!state ? "Pick a state first" : undefined}
            error={touched && state && !district ? "Select a district." : undefined}
          >
            <Select
              value={district}
              disabled={!state}
              onChange={(e) => {
                setDistrict(e.target.value);
                setMarketId("");
              }}
            >
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Market"
            hint={!district ? "Pick a district first" : undefined}
            error={touched && district && !marketId ? "Select a market." : undefined}
          >
            <Select
              value={marketId}
              disabled={!district}
              onChange={(e) => setMarketId(e.target.value)}
            >
              <option value="">Select market</option>
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Commodity"
            error={touched && !commodityId ? "Select a commodity." : undefined}
          >
            <Select value={commodityId} onChange={(e) => setCommodityId(e.target.value)}>
              <option value="">Select commodity</option>
              {COMMODITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-[32px] flex flex-wrap items-center gap-[16px]">
          <Button variant="solid" loading={running} onClick={run}>
            {running ? "Settling payment" : "Get quote"}
          </Button>
          <p className="text-[13px] text-ink-soft">
            Guard check runs before any payment attempt.
          </p>
        </div>
      </Panel>

      {denial && (
        <StateBlock
          tone="bad"
          title="Blocked by spend policy"
          body={denial}
          action={
            <Button onClick={run}>Try again — re-runs the guard check</Button>
          }
        />
      )}

      {(running || result) && !denial && (
        <PaymentStepper
          current={step}
          done={!!result && result.ok}
          failed={!!result && !result.ok}
        />
      )}

      {running && <QuoteSkeleton />}

      {!running && result?.ok && (
        <div className="flex flex-col gap-[24px]">
          <QuoteCard quote={result.quote} />
          <ReceiptPanel receipt={result.receipt} />
        </div>
      )}

      {!running && result && !result.ok && (
        <FailureView failure={result.failure} receipt={result.receipt} onRetry={run} />
      )}
    </div>
  );
}

function QuoteSkeleton() {
  return (
    <div className="rounded-[var(--radius-md)] border border-hair bg-page p-[24px] md:p-[32px]">
      <SkeletonBlock className="h-[14px] w-[140px]" />
      <SkeletonBlock className="mt-[24px] h-[40px] w-[220px]" />
      <div className="mt-[32px] grid grid-cols-1 gap-[24px] sm:grid-cols-3">
        <SkeletonBlock className="h-[64px]" />
        <SkeletonBlock className="h-[64px]" />
        <SkeletonBlock className="h-[64px]" />
      </div>
      <SkeletonBlock className="mt-[24px] h-[14px] w-[180px]" />
    </div>
  );
}

export function QuoteCard({ quote, muted = false }: { quote: PriceQuote; muted?: boolean }) {
  return (
    <div className="enter rounded-[var(--radius-md)] border border-hair bg-page p-[24px] md:p-[32px]">
      <MicroLabel>{quote.state} · {quote.district}</MicroLabel>
      <h2 className="display-sm mt-[12px] text-ink">
        {quote.commodity} · {quote.market}
      </h2>
      <div className="mt-[32px] grid grid-cols-1 gap-[24px] sm:grid-cols-3">
        <Stat label="Min" value={quote.min} />
        <Stat label="Modal" value={quote.modal} emphasis={!muted} />
        <Stat label="Max" value={quote.max} />
      </div>
      <div className="mt-[24px] flex flex-wrap items-center gap-[16px] border-t border-hair pt-[16px] text-[13px] text-ink-soft">
        <span>{quote.unit}</span>
        <span className="num">Arrivals {quote.arrivalsTonnes} t</span>
        <span className="num">Updated {formatAge(quote.ageMinutes)}</span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
}) {
  return (
    <div>
      <MicroLabel>{label}</MicroLabel>
      <p
        className={
          emphasis
            ? "num display-sm mt-[8px] text-brand"
            : "num display-sm mt-[8px] text-ink"
        }
      >
        ₹{value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function FailureView({
  failure,
  receipt,
  onRetry,
}: {
  failure: Extract<QuoteResult, { ok: false }>["failure"];
  receipt?: Receipt | undefined;
  onRetry: () => void;
}) {
  if (failure.kind === "stale-data") {
    return (
      <div className="flex flex-col gap-[24px]">
        <StateBlock
          tone="warn"
          title="Last known price only"
          body={failure.message}
          action={<Button onClick={onRetry}>Retry lookup</Button>}
        />
        <QuoteCard quote={failure.quote} muted />
        {receipt && <ReceiptPanel receipt={receipt} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[24px]">
      <StateBlock
        tone={failure.kind === "invalid-selection" ? "warn" : "bad"}
        title={
          failure.kind === "invalid-selection" ? "Incomplete selection" : "Market not found"
        }
        body={failure.message}
        action={<Button onClick={onRetry}>Try again</Button>}
      />
      {receipt && <ReceiptPanel receipt={receipt} />}
    </div>
  );
}