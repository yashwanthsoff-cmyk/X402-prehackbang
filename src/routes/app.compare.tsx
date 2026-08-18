import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BudgetMeter } from "@/components/budget-meter";
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
  mockFetchSignal,
  PRICE_PER_COMPARE,
  type CompareResult,
  type StepId,
} from "@/lib/mock-api";
import { COMMODITIES, formatAge, MARKETS, type PriceQuote } from "@/lib/mock-data";

export const Route = createFileRoute("/app/compare")({
  head: () => ({
    meta: [
      { title: "Premium Market Signal — MandiPulse" },
      {
        name: "description",
        content:
          "Premium x402 endpoint comparing one commodity across two mandis and returning a price-gap signal with freshness for both sides.",
      },
      { property: "og:title", content: "Premium Market Signal — MandiPulse" },
      {
        property: "og:description",
        content: "Pay more, get a computed multi-market spread instead of raw prices.",
      },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { checkBudget, recordSpend, logActivity } = useAppStore();

  const [commodityId, setCommodityId] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [touched, setTouched] = useState(false);

  const [step, setStep] = useState<StepId | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [denial, setDenial] = useState<string | null>(null);

  const sameMarket = !!a && a === b;
  const incomplete = !commodityId || !a || !b;

  async function run() {
    setTouched(true);
    if (incomplete || sameMarket) return;

    setResult(null);
    setStep(null);
    const verdict = checkBudget(PRICE_PER_COMPARE, "Market signal");
    if (!verdict.allowed) {
      setDenial(verdict.reason);
      logActivity({
        endpoint: "Market signal",
        amount: PRICE_PER_COMPARE,
        status: "Blocked",
        detail: verdict.reason,
      });
      return;
    }
    setDenial(null);
    setRunning(true);

    const res = await mockFetchSignal(commodityId, a, b, setStep);
    setResult(res);
    setRunning(false);

    if (res.ok || res.receipt) recordSpend(PRICE_PER_COMPARE);
    logActivity({
      endpoint: "Market signal",
      amount: PRICE_PER_COMPARE,
      status: res.ok
        ? "Settled"
        : res.failure.kind === "stale-side"
          ? "Stale data"
          : res.failure.kind === "no-coverage"
            ? "No coverage"
            : "Blocked",
      detail: res.ok ? `${res.a.market} vs ${res.b.market} · ${res.direction}` : res.failure.message,
      ...(res.ok ? { txId: res.receipt.txId } : res.receipt ? { txId: res.receipt.txId } : {}),
    });
  }

  return (
    <div className="flex flex-col gap-[48px]">
      <header className="flex flex-col gap-[16px]">
        <div className="flex flex-wrap items-center gap-[16px]">
          <MicroLabel>Endpoint 03 · premium</MicroLabel>
          <span className="micro rounded-[var(--radius-pill)] border border-brand px-[12px] py-[4px] text-brand">
            Premium
          </span>
        </div>
        <h1 className="display-md max-w-[600px] text-ink">Multi-market research signal</h1>
        <p className="max-w-[600px] text-[17px] text-ink-soft">
          One commodity, two mandis, one computed spread — priced at $
          {PRICE_PER_COMPARE.toFixed(2)} per call because the answer is a decision, not raw data.
        </p>
      </header>

      <BudgetMeter />

      <Panel>
        <MicroLabel>Comparison</MicroLabel>
        <div className="mt-[24px] grid grid-cols-1 gap-[24px] lg:grid-cols-3">
          <Field label="Commodity" error={touched && !commodityId ? "Select a commodity." : undefined}>
            <Select value={commodityId} onChange={(e) => setCommodityId(e.target.value)}>
              <option value="">Select commodity</option>
              {COMMODITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Market A" error={touched && !a ? "Select market A." : undefined}>
            <Select value={a} onChange={(e) => setA(e.target.value)}>
              <option value="">Select market</option>
              {MARKETS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {m.state}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Market B"
            error={
              sameMarket
                ? "Market B must differ from Market A."
                : touched && !b
                  ? "Select market B."
                  : undefined
            }
          >
            <Select value={b} onChange={(e) => setB(e.target.value)}>
              <option value="">Select market</option>
              {MARKETS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {m.state}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-[32px] flex flex-wrap items-center gap-[16px]">
          <Button variant="solid" loading={running} disabled={sameMarket} onClick={run}>
            {running ? "Settling payment" : "Get premium signal"}
          </Button>
          <p className="text-[13px] text-ink-soft">
            Same-market comparisons are blocked before any payment.
          </p>
        </div>
      </Panel>

      {denial && (
        <StateBlock
          tone="bad"
          title="Blocked by spend policy"
          body={denial}
          action={<Button onClick={run}>Try again — re-runs the guard check</Button>}
        />
      )}

      {(running || result) && !denial && (
        <PaymentStepper
          current={step}
          done={!!result && result.ok}
          failed={!!result && !result.ok}
          premium
        />
      )}

      {running && (
        <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
          <SkeletonBlock className="h-[220px]" />
          <SkeletonBlock className="h-[220px]" />
        </div>
      )}

      {!running && result?.ok && (
        <div className="flex flex-col gap-[24px]">
          <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
            <SideCard side="A" quote={result.a} />
            <SideCard side="B" quote={result.b} />
          </div>
          <div className="enter rounded-[var(--radius-md)] border border-hair bg-page-alt p-[24px] md:p-[32px]">
            <MicroLabel>Spread signal</MicroLabel>
            <p className="num display-md mt-[12px] text-brand">
              ₹{Math.abs(result.spread).toLocaleString("en-IN")}
            </p>
            <p className="mt-[8px] text-[15px] text-ink-soft">
              {result.direction} · <span className="num">{result.spreadPct}%</span> gap on modal
              price. Freshness: {formatAge(result.a.ageMinutes)} (A) ·{" "}
              {formatAge(result.b.ageMinutes)} (B).
            </p>
          </div>
          <ReceiptPanel receipt={result.receipt} />
        </div>
      )}

      {!running && result && !result.ok && (
        <div className="flex flex-col gap-[24px]">
          {result.failure.kind === "same-market" && (
            <StateBlock
              tone="warn"
              title="Two distinct markets required"
              body={result.failure.message}
            />
          )}
          {result.failure.kind === "no-coverage" && (
            <StateBlock
              tone="bad"
              title={`Market ${result.failure.side} not covered`}
              body={result.failure.message}
              action={<Button onClick={run}>Try another pair</Button>}
            />
          )}
          {result.failure.kind === "stale-side" && (
            <>
              <StateBlock
                tone="warn"
                title="Signal unavailable — one side is stale"
                body={result.failure.message}
              />
              <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2">
                {result.failure.a && <SideCard side="A" quote={result.failure.a} muted />}
                {result.failure.b && <SideCard side="B" quote={result.failure.b} muted />}
              </div>
            </>
          )}
          {result.receipt && <ReceiptPanel receipt={result.receipt} />}
        </div>
      )}
    </div>
  );
}

function SideCard({
  side,
  quote,
  muted = false,
}: {
  side: "A" | "B";
  quote: PriceQuote;
  muted?: boolean;
}) {
  return (
    <div className="enter rounded-[var(--radius-md)] border border-hair bg-page p-[24px] md:p-[32px]">
      <MicroLabel>Market {side}</MicroLabel>
      <h2 className="display-sm mt-[12px] text-ink">{quote.market}</h2>
      <p className="mt-[4px] text-[14px] text-ink-soft">
        {quote.district} · {quote.state}
      </p>
      <p className={muted ? "num display-sm mt-[24px] text-ink" : "num display-sm mt-[24px] text-brand"}>
        ₹{quote.modal.toLocaleString("en-IN")}
      </p>
      <p className="num mt-[8px] text-[14px] text-ink-soft">
        Range ₹{quote.min.toLocaleString("en-IN")} – ₹{quote.max.toLocaleString("en-IN")}
      </p>
      <p className="num mt-[16px] border-t border-hair pt-[16px] text-[13px] text-ink-soft">
        Updated {formatAge(quote.ageMinutes)}
      </p>
    </div>
  );
}